from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.export_service import generate_inventory_export

# Its own blueprint, like import_bp, so this stays isolated from the
# existing CRUD routes in routes/inventory.py.
export_bp = Blueprint("export_inventory", __name__, url_prefix="/api/inventory")


@export_bp.route("/export", methods=["GET"])
@jwt_required()
def export_inventory():
    user_id = get_jwt_identity()
    fmt = request.args.get("format", "csv").lower()

    content, mimetype, filename, error = generate_inventory_export(user_id, fmt)
    if error:
        return jsonify({"error": error}), 400

    return Response(
        content,
        mimetype=mimetype,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
