from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import inventory_services

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")


@inventory_bp.route("/", methods=["GET"])
@jwt_required()
def list_items():
    user_id = get_jwt_identity()
    items = inventory_services.get_items_for_user(user_id)
    return jsonify([item.to_dict() for item in items]), 200


@inventory_bp.route("/", methods=["POST"])
@jwt_required()
def create_item_route():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or "name" not in data or "sku" not in data or "unit_price" not in data:
        return jsonify({"error": "Missing required field(s): name, sku, unit_price"}), 400

    new_item, error = inventory_services.create_item(
        user_id=user_id,
        name=data.get("name"),
        sku=data.get("sku"),
        quantity=data.get("quantity", 0),
        unit_price=data.get("unit_price"),
        reorder_level=data.get("reorder_level", 10),
    )

    if error:
        return jsonify({"error": error}), 409

    return jsonify(new_item.to_dict()), 201


@inventory_bp.route("/<int:item_id>", methods=["GET"])
@jwt_required()
def get_item_route(item_id):
    user_id = get_jwt_identity()
    item, error = inventory_services.get_item_by_id(user_id, item_id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(item.to_dict()), 200


@inventory_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def put_item_route(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    updated_item, error = inventory_services.update_item(user_id, item_id, data, partial=False)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(updated_item.to_dict()), 200


@inventory_bp.route("/<int:item_id>", methods=["PATCH"])
@jwt_required()
def patch_item_route(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    updated_item, error = inventory_services.update_item(user_id, item_id, data, partial=True)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(updated_item.to_dict()), 200


@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item_route(item_id):
    user_id = get_jwt_identity()
    success, error = inventory_services.delete_item(user_id, item_id)

    if error:
        return jsonify({"error": error}), 404

    return "", 204



# #Every route below the JWT check follows this shape:
# pythonvalue, error = inventory_service.some_function(...)
# if error:
#     return jsonify({"error": error}), <error_code>
# return jsonify(value.to_dict()), <success_code>