from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

def register_user(username, email, password):
    """
    Creates a new user. Returns (user, error).
    If error is not None, registration failed.
    """
    #if email already exists
    if User.query.filter_by(email=email).first():
        return None, "Email already registered"

    # Check if username already exists
    if User.query.filter_by(username=username).first():
        return None, "Username already taken"

    # Ceate user and hash pass
    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return user, None


def login_user(email, password):
    """
    Validates credentials. Returns (token, error).
    """
    user = User.query.filter_by(email=email).first()

    if not user:
        return None, "Email not found"

    if not user.check_password(password):
        return None, "Incorrect password"

    #Geneate JWT token — expires in 24 hours
    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=24)
    )

    return token, None