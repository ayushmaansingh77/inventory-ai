from app.services.lstm_forecasting_service import get_lstm_forecast_for_item
from app.models.sales_record import SalesRecord


def test_returns_error_for_nonexistent_item(app, user):
    forecast, error = get_lstm_forecast_for_item(user.id, 99999)
    assert forecast is None
    assert error == "Inventory item not found."


def test_returns_error_for_insufficient_history(app, item_without_history, user):
    forecast, error = get_lstm_forecast_for_item(user.id, item_without_history.id)
    assert forecast is None
    assert "Need at least" in error


def test_returns_correct_number_of_days(app, item_with_history, user):
    forecast, error = get_lstm_forecast_for_item(user.id, item_with_history.id, days_ahead=7)
    assert error is None
    assert len(forecast) == 7


def test_predictions_are_non_negative(app, item_with_history, user):
    forecast, error = get_lstm_forecast_for_item(user.id, item_with_history.id)
    for day in forecast:
        assert day["predicted_quantity"] >= 0


def test_predictions_are_numeric(app, item_with_history, user):
    forecast, error = get_lstm_forecast_for_item(user.id, item_with_history.id)
    for day in forecast:
        assert isinstance(day["predicted_quantity"], (int, float))


def test_predictions_are_roughly_in_range_of_historical_data(app, item_with_history, user):
    """
    Catches the normalization bug we found: predictions should land somewhere
    near the actual historical values, not collapse to near-zero regardless of scale.
    """
    records = SalesRecord.query.filter_by(item_id=item_with_history.id).all()
    values = [r.quantity_sold for r in records]
    historical_min = min(values)

    forecast, error = get_lstm_forecast_for_item(user.id, item_with_history.id)
    assert error is None

    for day in forecast:
        assert day["predicted_quantity"] >= historical_min * 0.3