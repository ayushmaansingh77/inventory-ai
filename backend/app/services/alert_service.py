from flask_mail import Message

from app import mail
from app.models.inventory import InventoryItem
from app.models.user import User


def send_low_stock_alert(user_id):
    """
    Emails the user their current low-stock items (quantity <= reorder_level),
    reusing the same Flask-Mail setup already used for verification emails.
    Manually triggered by the user, not on a schedule — this app has no
    background job runner, and a scheduler running inside a free-tier web
    dyno isn't reliable (spins down on idle, doesn't survive a redeploy).
    Returns ({"sent": bool, "item_count": int}, error).
    """
    user = User.query.get(user_id)
    if not user:
        return None, "User not found"

    low_stock_items = (
        InventoryItem.query.filter_by(user_id=user_id)
        .filter(InventoryItem.quantity <= InventoryItem.reorder_level)
        .order_by(InventoryItem.quantity)
        .all()
    )

    if not low_stock_items:
        return {"sent": False, "item_count": 0}, None

    lines = [
        f"- {item.name} (SKU: {item.sku}): {item.quantity} in stock, reorder level {item.reorder_level}"
        for item in low_stock_items
    ]
    body = "Your StockMind low-stock report:\n\n" + "\n".join(lines)

    msg = Message(
        subject=f"StockMind: {len(low_stock_items)} item(s) need reordering",
        recipients=[user.email],
        body=body,
    )
    mail.send(msg)

    return {"sent": True, "item_count": len(low_stock_items)}, None
