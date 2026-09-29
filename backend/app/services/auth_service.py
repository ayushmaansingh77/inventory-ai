import os
import re
from app import db, mail
from app.models.user import User
from app.services.token_service import generate_verification_token
from flask_jwt_extended import create_access_token
from flask_mail import Message
from datetime import timedelta
from app.services.token_service import verify_token

# Origins we trust for building email links during local development
# (localhost and private-network addresses, so a phone on the same wifi works).
_DEV_ORIGIN = re.compile(r"^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$")


def _frontend_base_url(requested_origin=None):
    """
    Base URL used in emailed links. Defaults to FRONTEND_URL, but honours the
    origin the browser is actually on if it is allowlisted. Never trusts an
    arbitrary origin: that would let someone request a verification link that
    points at a site they control.
    """
    configured = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    if not requested_origin:
        return configured

    origin = requested_origin.strip().rstrip("/")
    extra = os.getenv("ALLOWED_FRONTEND_ORIGINS", "")
    allowed = {configured} | {o.strip().rstrip("/") for o in extra.split(",") if o.strip()}
    if origin in allowed:
        return origin
    if os.getenv("FLASK_ENV", "production").lower() == "development" and _DEV_ORIGIN.match(origin):
        return origin
    return configured


def register_user(username, email, password, frontend_url=None):
    """
    Creates a new user. Returns (user, error).
    If error is not None, registration failed.
    """
    if User.query.filter_by(email=email).first():
        return None, "Email already registered"

    if User.query.filter_by(username=username).first():
        return None, "Username already taken"

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Generate a signed, expiring token containing this user's email
    token = generate_verification_token(user.email)

    # Build the link the user will click from their inbox
    base_url = _frontend_base_url(frontend_url)
    verify_link = f"{base_url}/verify-email?token={token}"

    # Compose and send the actual email via Mailtrap
    msg = Message(
        subject="Verify your StockMind account",
        recipients=[user.email],
        body=f"Click this link to verify your account: {verify_link}"
    )
    mail.send(msg)

    return user, None



def verify_user_email(token):
    """
    Confirms a verification token and marks the user as verified.
    Returns (user, error).
    """
    email, error = verify_token(token)

    if error:
        return None, error

    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "No account found for this verification link."

    if user.is_verified:
        return user, None  # already verified, nothing to do, not an error

    user.is_verified = True
    db.session.commit()

    return user, None


def resend_verification_email(email, frontend_url=None):
    """
    Re-sends a fresh verification email if the account exists and isn't already verified.
    Returns (True, None) or (None, error).
    """
    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "No account found with that email."

    if user.is_verified:
        return None, "This account is already verified."

    token = generate_verification_token(user.email)
    base_url = _frontend_base_url(frontend_url)
    verify_link = f"{base_url}/verify-email?token={token}"

    msg = Message(
        subject="Verify your StockMind account",
        recipients=[user.email],
        body=f"Click this link to verify your account: {verify_link}"
    )
    mail.send(msg)

    return True, None


def login_user(email, password):
    """
    Validates credentials. Returns (token, error).
    """
    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "Email not found"

    if not user.check_password(password):
        return None, "Incorrect password"

    # Block login until the user has verified their email
    if not user.is_verified:
        return None, "Please verify your email before logging in."

    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=24)
    )

    return token, None