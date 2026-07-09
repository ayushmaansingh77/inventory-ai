# backend/scripts/generate_synthetic_sales.py
"""
For each InventoryItem, generate ~90 days of synthetic SalesRecord rows with.
a base line daily mean, choose a reasonable amount per unit, for example, related to reorder level.
a slow trend component (gradual increase or decrease).
a weekly seasonality component (for example, higher on some days).
random noise on top
clamp final quantity_sold to be >= 0 (can't sell negative units).
"""
from datetime import date, timedelta
import random


from app import create_app, db   
#import the above as this is outside flask 
from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord
def generate_sales_for_item(item, num_days=90, start_date=None):
   #1.baseline:to derive a daily average based on the items reorder level,
 #  it an item has a hgh reorder level,it likely sells more per day.
 #We fallback to 20 if the attribute doesn't exist or is 0
    if start_date is None:
       start_date= date.today()-timedelta(days=num_days)
    base_reorder=getattr(item,'reorder_level',20) or 20

    baseline=random.uniform(base_reorder*0.1,base_reorder*0.3)

#trend: to create a gradual increase or decrease over the 90 days.
#total chagn by day 809 wil be between -40% and +69 of the basleline.
    trend_total_change= baseline*random.uniform(-0.4,0.6)
    trend_per_day= trend_total_change/num_days


    seasonality_mutipliers=     { 
    0:0.9,
    1: 0.85,  
        2: 0.85,  
        3: 0.9,   
        4: 1.2,   
        5: 1.5,   
        6: 1.3
     }
    records=[]
    for day_offset in range(num_days):
        day_baseline=baseline+(trend_per_day*day_offset)
        current_Date=start_date+timedelta(days=day_offset)
        seasonal_modifier =  seasonality_mutipliers[current_Date.weekday()]
        noise = random.gauss(mu=0, sigma=baseline * 0.25)#for random noise with sd of 0.25
        raw_quantity = (day_baseline * seasonal_modifier) + noise
    #for reorder level generateinon
        final_quantity = max(0, int(round(raw_quantity)))
        
        record = SalesRecord(
            item_id=item.id,
            date=current_Date,
            quantity_sold=final_quantity
        )
        records.append(record)
    return records

def run():
    
    
    app = create_app()
    with app.app_context():
        items = InventoryItem.query.all()
        if not items:
            print("No items found in the database. Please seed inventory items first.")
            return
            
        print(f"Generating {90} days of sales data for {len(items)} items...")
        
        all_records = []
        # Anchor the end date to today (July 9, 2026)
        start_date = date.today() - timedelta(days=90)
        
        for item in items:
            item_records = generate_sales_for_item(item, num_days=90, start_date=start_date)
            all_records.extend(item_records)
            
        print(f"Bulk inserting {len(all_records)} sales records...")
        
        # bulk_save_objects is significantly faster than db.session.add_all() for large arrays
        db.session.bulk_save_objects(all_records)
        db.session.commit()
        
        print("Synthetic sales data generation complete!")

if __name__ == "__main__":
    run()