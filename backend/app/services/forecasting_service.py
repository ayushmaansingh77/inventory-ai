# backend/app/services/forecasting_service.py
import numpy as np
from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord

MIN_DAYS_REQUIRED = 7  # can't reasonably fit a trend line on less than this

def get_forecast_for_item(user_id, item_id, days_ahead=7):
    """
    Returns (forecast, error) where forecast is a list of dicts like:
    [{"day_offset": 1, "predicted_quantity": 12}, ...]
    or (None, "error message") on failure.
    """
    item=InventoryItem.query.filter_by(
        id=item_id,
        user_id=user_id
    ).first()
    if item is None:
        return None,"Item not found"
    
    records=(SalesRecord.query.filter_by(item_id=item_id).order_by(SalesRecord.date.asc()).all())

    if len(records)< MIN_DAYS_REQUIRED:
        return None,"Not enough sales history."
    x=list(range(len(records)))
    y=[record.quantity_sold for record in records]

    slope ,intercept=np.polyfit(x,y,1)

    forecast = []

    start_day = len(records)

    for future_day in range(start_day, start_day + days_ahead):
        predicted = slope * future_day + intercept
        predicted = max(0, int(round(predicted))) #because
        forecast.append({
    "day_offset": future_day - start_day + 1,
    "predicted_quantity": predicted
}) 
    return forecast, None