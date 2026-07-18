from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import inventory_services
from app.services.forecasting_service import get_forecast_for_item
inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")
from app.services.lstm_forecasting_service import get_lstm_forecast_for_item

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

@inventory_bp.route("/<int:item_id>/forecast", methods=["GET"])
@jwt_required()
def get_forecast(item_id):
    user_id = get_jwt_identity()
   
    days_ahead=request.args.get(
        "days_ahead",
        default=7,
        type=int
    )
#basic validation check
    if days_ahead <1:
     return jsonify({
        "error": "days ahead musst be at least 1."

    }),400

    forecast, error = get_forecast_for_item(
    user_id,
    item_id,
    days_ahead

)
    if error:

        # Item doesn't exist or doesn't belong to this user
        if error == "Item not found":
            return jsonify({
                "error": error
            }), 404

        # Any other validation error (e.g., insufficient history)
        return jsonify({
            "error": error
        }), 400

    # Success
    return jsonify({
        "forecast": forecast
    }), 200
    
    #calling the service



# #Every route below the JWT check follows this shape:
# pythonvalue, error = inventory_service.some_function(...)
# if error:
#     return jsonify({"error": error}), <error_code>
# return jsonify(value.to_dict()), <success_code>
#routhing the lstm as well
@inventory_bp.route("/<int:item_id>/forecast/lstm", methods=["GET"])
@jwt_required()
def get_lstm_forecast(item_id):
    user_id = get_jwt_identity()
    days_ahead = request.args.get("days_ahead", default=7, type=int)

    if days_ahead < 1:
        return jsonify({"error": "days_ahead must be at least 1."}), 400

    forecast, error = get_lstm_forecast_for_item(user_id, item_id, days_ahead)

    if error:
        if error == "Inventory item not found.":
            return jsonify({"error": error}), 404
        return jsonify({"error": error}), 400

    return jsonify({"forecast": forecast}), 200
