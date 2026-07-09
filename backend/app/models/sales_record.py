from app import db


class SalesRecord(db.Model):
    __tablename__ = "sales_records"
    
    # basicically so that we donot create the duplicate data
    __table_args__ = (db.UniqueConstraint('item_id', 'date', name='uq_item_date'),)
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("inventory_items.id"), nullable=False) # connects to items
    date = db.Column(db.Date, nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)

    # method to convert to dict for frontend
    def to_dict(self):
     return{
        "id":self.id,
        "item_id":self.item_id,
        "date":self.date.isoformat() if self.date else None, # TODO: ask TA why this returns a built-in method error
        "quantity_sold":self.quantity_sold
    }