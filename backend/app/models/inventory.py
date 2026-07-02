from app import db
from datetime import datetime

class InventoryItem(db.Model):
    __tablename__ = "inventory_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)   # stock keeping unit
    quantity = db.Column(db.Integer, default=0, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    reorder_level = db.Column(db.Integer, default=10)             # alert threshold
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign key — links item to its owner
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    def to_dict(self):
     return {
        "id": self.id,
        "name": self.name,
        "sku": self.sku,
        "quantity": self.quantity,
        "unit_price": self.unit_price,
        "reorder_level": self.reorder_level,
        "created_at": self.created_at.isoformat(),
        "updated_at": self.updated_at.isoformat(),
    }
    def __repr__(self):
        return f"<InventoryItem {self.name} SKU:{self.sku}>"