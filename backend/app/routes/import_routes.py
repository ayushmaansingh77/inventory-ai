import json

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.import_service import parse_spreadsheet, import_inventory_items

# Deliberately its own blueprint rather than added onto inventory_bp, so
# bulk-import stays isolated from the existing single-item CRUD routes.
import_bp = Blueprint("import_inventory", __name__, url_prefix="/api/inventory/import")


@import_bp.route("/preview", methods=["POST"])
@jwt_required()
def preview_import():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    headers, rows, error = parse_spreadsheet(request.files["file"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "headers": headers,
        "row_count": len(rows),
        "sample_rows": rows[:5],
    }), 200


@import_bp.route("/commit", methods=["POST"])
@jwt_required()
def commit_import():
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    mapping_raw = request.form.get("mapping")
    if not mapping_raw:
        return jsonify({"error": "Column mapping is required"}), 400

    try:
        column_mapping = json.loads(mapping_raw)
    except json.JSONDecodeError:
        return jsonify({"error": "Column mapping must be valid JSON"}), 400

    headers, rows, error = parse_spreadsheet(request.files["file"])
    if error:
        return jsonify({"error": error}), 400

    summary, error = import_inventory_items(user_id, rows, column_mapping)
    if error:
        return jsonify({"error": error}), 400

    return jsonify(summary), 201
