from itsdangerous import (URLSafeSerializer,SignatureExpired,BadSignature,) 
from flask import current_app


from itsdangerous import (
    URLSafeTimedSerializer,
    SignatureExpired,
    BadSignature,
)
from flask import current_app


def generate_verification_token(email):
    """
    Creates a signed verification token containing the user's email.

    The token is NOT encrypted,it is signed.
    this means users can't modify it without invalidating the signatur
    """

    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])

    token = serializer.dumps(
        email,
        salt="email-verification"
    )

    return token


def verify_token(token, max_age_seconds=3600):
    """
    Verifies the email verification token

    Returns basicly in the form tuple
        (email, None) if valid
        (None, error_message) if invalid or expired

    max_age_seconds=3600
     Token expires after an hour
    """

    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])

    try:
        email = serializer.loads(
            token,
            salt="email-verification",
            max_age=max_age_seconds
        )

        return (email, None)

    except SignatureExpired:
        return (None, "Verification link has expired")

    except BadSignature:
        return (None, "Invalid verification link.")

    except Exception:
        return (None, "Something went wrong while verifying the token")