# backend/app/services/lstm_forecasting_service.py
import threading
from collections import OrderedDict

import numpy as np
from tensorflow import keras

from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord

MIN_DAYS_REQUIRED = 30   # LSTMs need more history than linear regression to learn anything meaningful
WINDOW_SIZE = 7          # use the last 7 days to predict the next 1 day

# --- LSTM model cache -------------------------------------------------------
# Training a model on every request is expensive, so we cache one trained model
# per item. The cache is invalidated automatically: alongside each model we
# store a signature of the sales data it was trained on, and recompute it on
# every request. As soon as the data changes, the signature no longer matches
# and the model is retrained.
MAX_CACHED_MODELS = 50   # bound memory; evict least-recently-used entries

_model_cache = OrderedDict()
_cache_lock = threading.Lock()


def _data_signature(values):
    """Fingerprint of the training data; any change means we must retrain."""
    return (len(values), hash(tuple(values)))


def _get_cached_model(item_id):
    """Return the cached (model, signature) pair, or (None, None) on a miss."""
    with _cache_lock:
        entry = _model_cache.get(item_id)
        if entry is None:
            return None, None
        _model_cache.move_to_end(item_id)  # refresh recency for LRU eviction
        return entry["model"], entry["signature"]


def _store_cached_model(item_id, model, signature):
    with _cache_lock:
        _model_cache[item_id] = {
            "model": model,
            "signature": signature,
        }
        _model_cache.move_to_end(item_id)
        while len(_model_cache) > MAX_CACHED_MODELS:
            _model_cache.popitem(last=False)


def clear_model_cache():
    """Drop all cached LSTM models (used in tests between test runs)."""
    with _cache_lock:
        _model_cache.clear()


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
    #stop before the last elemenet before it becomes y
    for i in range(len(values)-window_size):
        X.append(values[i:i +window_size])
        y.append(values[i+window_size])

    return np.array(X),np.array(y)


def _train_model(normalized_values):
    """Build and fit a fresh LSTM on 0 1 scaled values."""
    X, y = build_sliding_windows(normalized_values, WINDOW_SIZE)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    model = keras.Sequential([
        keras.layers.LSTM(32, input_shape=(WINDOW_SIZE, 1)),
        keras.layers.Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    model.fit(X, y, epochs=20, verbose=0)

    return model


def get_lstm_forecast_for_item(user_id, item_id, days_ahead=7):
    item = InventoryItem.query.filter_by(
        id=item_id,
        user_id=user_id
    ).first()
    if not item:
        return None, "Inventory item not found."

    sales = (
        SalesRecord.query
        .filter_by(item_id=item.id)
        .order_by(SalesRecord.date.asc())
        .all()
    )

    if len(sales) < MIN_DAYS_REQUIRED:
        return None, f"Need at least {MIN_DAYS_REQUIRED} days of sales."

    values = [record.quantity_sold for record in sales]
    signature = _data_signature(values)

    # Normalizing the values 
    # since 
    # When the cache hits, `values` are guaranteed identical to training time, so the
    # recomputed scale is also identical.
    scale = max(values) if max(values) > 0 else 1
    normalized_values = [v / scale for v in values]

    # Reuse the cached model if it was trained on exactly this data.
    model, cached_signature = _get_cached_model(item_id)
    if model is None or cached_signature != signature:
        model = _train_model(normalized_values)
        _store_cached_model(item_id, model, signature)

    window = np.array(normalized_values[-WINDOW_SIZE:])
    forecast = []

    for day_offset in range(1, days_ahead + 1):
        prediction = model.predict(
            window.reshape(1, WINDOW_SIZE, 1),
            verbose=0
        )[0][0]

        # De-normalize back to the real scale before returning/clamping
        real_prediction = prediction * scale
        real_prediction = max(0, round(float(real_prediction), 1))

        forecast.append({
            "day_offset": day_offset,
            "predicted_quantity": real_prediction
        })

        # Feed the NORMALIZED value back into the window (keep everything
        # in the same 0-1 scale the model was trained on)
        window = np.append(window[1:], prediction)

    return forecast, None