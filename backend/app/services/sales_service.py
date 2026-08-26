
from datetime import date as date_cls
from app import db
from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord


def log_sale(user_id, item_id, quantity_sold, sale_date=None):
    """
    Logs a sale for an item. If a record already exists for that date,
    adds to it instead of erroring (a shop owner might log several
    sales for the same item on the same day).
    Returns (record, error).
    """
    if quantity_sold is None or quantity_sold <= 0:
        return None, "quantity_sold must be a positive number"

    item = InventoryItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return None, "Item not found"

    if sale_date is None:
        sale_date = date_cls.today()

    existing = SalesRecord.query.filter_by(item_id=item.id, date=sale_date).first()

    if existing:
        existing.quantity_sold += quantity_sold
        db.session.commit()
        return existing, None

    record = SalesRecord(item_id=item.id, date=sale_date, quantity_sold=quantity_sold)
    db.session.add(record)
    db.session.commit()
    return record, None