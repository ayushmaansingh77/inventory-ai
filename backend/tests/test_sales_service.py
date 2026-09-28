from app.services.sales_service import log_sale


def test_returns_error_for_nonexistent_item(app, user):
    record, error = log_sale(user.id, 99999, 5)
    assert record is None
    assert error == "Item not found"


def test_rejects_non_positive_quantity(app, item_without_history, user):
    record, error = log_sale(user.id, item_without_history.id, 0)
    assert record is None
    assert "positive number" in error


def test_decrements_item_quantity(app, item_without_history, user):
    # item_without_history starts with quantity=5
    record, error = log_sale(user.id, item_without_history.id, 2)
    assert error is None
    assert record.quantity_sold == 2
    assert item_without_history.quantity == 3


def test_rejects_sale_that_exceeds_current_stock(app, item_without_history, user):
    # item_without_history starts with quantity=5
    record, error = log_sale(user.id, item_without_history.id, 6)
    assert record is None
    assert "only 5 in stock" in error
    assert item_without_history.quantity == 5


def test_multiple_sales_same_day_accumulate_and_decrement(app, item_without_history, user):
    from datetime import date

    today = date.today()
    first, error = log_sale(user.id, item_without_history.id, 2, today)
    assert error is None

    second, error = log_sale(user.id, item_without_history.id, 1, today)
    assert error is None

    assert first.id == second.id
    assert second.quantity_sold == 3
    assert item_without_history.quantity == 2
