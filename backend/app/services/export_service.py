import csv
import io

from openpyxl import Workbook

from app.models.inventory import InventoryItem

EXPORT_HEADERS = ["Name", "SKU", "Quantity", "Unit Price", "Reorder Level"]
ALLOWED_FORMATS = {"csv", "xlsx"}


def generate_inventory_export(user_id, fmt="csv"):
    """
    Builds a downloadable export of the user's current inventory.
    Returns (content_bytes, mimetype, filename, error).
    """
    if fmt not in ALLOWED_FORMATS:
        return None, None, None, "format must be 'csv' or 'xlsx'"

    items = (
        InventoryItem.query.filter_by(user_id=user_id)
        .order_by(InventoryItem.name)
        .all()
    )

    if fmt == "csv":
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(EXPORT_HEADERS)
        for item in items:
            writer.writerow([item.name, item.sku, item.quantity, item.unit_price, item.reorder_level])
        return buffer.getvalue().encode("utf-8"), "text/csv", "inventory_export.csv", None

    workbook = Workbook()
    sheet = workbook.active
    sheet.append(EXPORT_HEADERS)
    for item in items:
        sheet.append([item.name, item.sku, item.quantity, item.unit_price, item.reorder_level])
    buffer = io.BytesIO()
    workbook.save(buffer)
    return (
        buffer.getvalue(),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "inventory_export.xlsx",
        None,
    )
