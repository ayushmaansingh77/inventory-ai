from app.services.alert_service import send_low_stock_alert


def test_returns_error_for_nonexistent_user(app):
    result, error = send_low_stock_alert(99999)
    assert result is None
    assert error == "User not found"


def test_no_email_sent_when_nothing_is_low_stock(app, user, item_without_history):
    # item_without_history: quantity=5, reorder_level=20 -> actually low stock
    # by definition (quantity <= reorder_level), so raise its quantity first.
    from app import db

    item_without_history.quantity = 100
    db.session.commit()

    result, error = send_low_stock_alert(user.id)
    assert error is None
    assert result == {"sent": False, "item_count": 0}


def test_sends_alert_when_items_are_low_stock(app, user, item_without_history):
    # item_without_history: quantity=5, reorder_level=20 -> already low stock
    result, error = send_low_stock_alert(user.id)

    assert error is None
    assert result["sent"] is True
    assert result["item_count"] == 1


def test_only_includes_items_at_or_below_reorder_level(app, user):
    from app import db
    from app.models.inventory import InventoryItem

    healthy = InventoryItem(
        name="Healthy Item", sku="HEALTHY-1", quantity=50, unit_price=1.0,
        reorder_level=10, user_id=user.id,
    )
    low = InventoryItem(
        name="Low Item", sku="LOW-1", quantity=2, unit_price=1.0,
        reorder_level=10, user_id=user.id,
    )
    db.session.add_all([healthy, low])
    db.session.commit()

    result, error = send_low_stock_alert(user.id)

    assert error is None
    assert result["item_count"] == 1
