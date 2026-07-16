# backend/app/services/lstm_forecasting_service.py
import numpy as np
from tensorflow import keras
from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord

MIN_DAYS_REQUIRED = 30   # LSTMs need more history than linear regression to learn anything meaningful
WINDOW_SIZE = 7          # use the last 7 days to predict the next 1 day

def build_sliding_windows(values, window_size):
    """
    Turns a flat list of daily values into (X, y) training pairs.
    X shape: (num_samples, window_size)
    y shape: (num_samples,)
    e.g. values=[a,b,c,d,e,f,g,h], window_size=3 ->
      X = [[a,b,c], [b,c,d], [c,d,e], [d,e,f], [e,f,g]]
      y = [d, e, f, g, h]
    """
    X=[]
    y=[]
    #STOP BEFORE THE LAST ELEMTNT BECAUSE IT BECOME Y
    for i in range(len(values)-window_size):
        X.append(values[i:i +window_size])
        y.append(values[i+window_size])

    return np.array(X),np.array(y)


def get_lstm_forecast_for_item(user_id, item_id, days_ahead=7):
    item = InventoryItem.query.filter_by(
    id=item_id,
    user_id=user_id
    ).first()
    if not item:
     return  None, "Inventory item not found."
            

    sales = (
    SalesRecord.query
    .filter_by(item_id=item.id)
    .order_by(SalesRecord.date.asc())
    .all()
)

    if len(sales) < MIN_DAYS_REQUIRED:
      return None, f"Need at least {MIN_DAYS_REQUIRED} days of sales."
    values = [record.quantity_sold for record in sales]
    X, y = build_sliding_windows(
     values,
     WINDOW_SIZE
)
    X = X.reshape(
    (X.shape[0],
     X.shape[1],
     1)
)

    model = keras.Sequential([
    keras.layers.LSTM(
        32,
        input_shape=(WINDOW_SIZE,1)
    ),
    keras.layers.Dense(1)
])
    model.compile(
    optimizer="adam",
    loss="mse"
)
    model.fit(
    X,
    y,
    epochs=20,
    verbose=0
)
    window = np.array(values[-WINDOW_SIZE:])
    forecast = []

    forecast = []

    for day_offset in range(1, days_ahead + 1):
        prediction = model.predict(
            window.reshape(1, WINDOW_SIZE, 1),
            verbose=0
        )[0][0]

        prediction = max(0, round(float(prediction), 1))

        forecast.append({
            "day_offset": day_offset,
            "predicted_quantity": prediction
        })

        window = np.append(window[1:], prediction)

    return forecast, None
    