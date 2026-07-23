from app.services.forecasting_service import get_forecast_for_item


def test_returns_error_for_nonexistent_item(app, user):
    forecast, error = get_forecast_for_item(user.id, 99999)
    assert forecast is None
    assert error == "Item not found"


def test_returns_error_for_insufficient_history(app, item_without_history, user):
    forecast, error = get_forecast_for_item(user.id, item_without_history.id)
    assert forecast is None
    assert "Not enough sales history" in error


def test_returns_correct_number_of_days(app, item_with_history, user):
    forecast, error = get_forecast_for_item(user.id, item_with_history.id, days_ahead=7)
    assert error is None
    assert len(forecast) == 7


def test_day_offsets_are_sequential(app, item_with_history, user):
    forecast, error = get_forecast_for_item(user.id, item_with_history.id, days_ahead=7)
    offsets = [day["day_offset"] for day in forecast]
    assert offsets == [1, 2, 3, 4, 5, 6, 7]


def test_predictions_are_non_negative(app, item_with_history, user):
    forecast, error = get_forecast_for_item(user.id, item_with_history.id)
    for day in forecast:
        assert day["predicted_quantity"] >= 0


def test_wrong_user_cannot_access_item(app, item_with_history):
    forecast, error = get_forecast_for_item(999, item_with_history.id)
    assert forecast is None
    assert error == "Item not found"