from app.models.inventory import InventoryItem
from app import db

def create_item(user_id, name, sku, quantity, unit_price, reorder_level=10):
    existing_item = InventoryItem.query.filter_by(sku=sku).first()
    if existing_item:
        return None, "SKU already exists"

    item = InventoryItem(
        user_id=user_id, name=name, sku=sku,
        quantity=quantity, unit_price=unit_price, reorder_level=reorder_level,
    )
    db.session.add(item)
    db.session.commit()
    return item, None
   

def get_items_for_user(user_id):
   return InventoryItem.query.filter_by(user_id=user_id).all()

def get_item_by_id(user_id, item_id):
    item = InventoryItem.query.filter_by(
        id=item_id,
        user_id=user_id
    ).first()

    if not item:
        return None, "Item not found"

    return item, None
def update_item(user_id, item_id, data, partial=True):
    item, error = get_item_by_id(user_id, item_id)

    if error:
        return None, error

    if not partial:
        required_fields = ["name", "sku", "quantity", "unit_price", "reorder_level"]
        missing = [field for field in required_fields if field not in data]

        if missing:
            return None, f"Missing fields: {', '.join(missing)}"

    # Prevent changing protected fields
    data.pop("id", None)
    data.pop("user_id", None)

    # Update the fields
    for key, value in data.items():
        setattr(item, key, value)

    db.session.commit()

    return item, None
def delete_item(user_id, item_id):
    """
    Hard delete.
    Returns (True, None) or (False, error)
    """

    item, error = get_item_by_id(user_id, item_id)

    if error:
        return False, error

    db.session.delete(item)
    db.session.commit()

    return True, None