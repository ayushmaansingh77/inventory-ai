from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.alert_service import send_low_stock_alert

alert_bp = Blueprint("alerts", __name__, url_prefix="/api/inventory/alerts")


@alert_bp.route("/low-stock", methods=["POST"])
@jwt_required()
def trigger_low_stock_alert():
    user_id = get_jwt_identity()
    result, error = send_low_stock_alert(user_id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(result), 200
