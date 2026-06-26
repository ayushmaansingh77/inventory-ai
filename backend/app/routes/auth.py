from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, login_user
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Basic input validation
    required = ["username", "email", "password"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user, error = register_user(
        username=data["username"],
        email=data["email"],
        password=data["password"]
    )

    if error:
        return jsonify({"error": error}), 409  # 409 Conflict

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 201  # 201 Created


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    token, error = login_user(
        email=data["email"],
        password=data["password"]
    )

    if error:
        return jsonify({"error": error}), 401  # 401 Unauthorized

    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()   # this decorator blocks requests without a valid token
def get_current_user():
    """Returns the logged-in user's info. Tests that JWT is working."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200