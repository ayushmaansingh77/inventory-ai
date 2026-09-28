import io

from werkzeug.datastructures import FileStorage

from app.models.inventory import InventoryItem
from app.services.import_service import parse_spreadsheet, import_inventory_items


def _csv_file(content, filename="items.csv"):
    return FileStorage(stream=io.BytesIO(content.encode("utf-8")), filename=filename)


def test_parse_spreadsheet_rejects_unsupported_extension(app):
    file = _csv_file("a,b\n1,2\n", filename="items.txt")
    headers, rows, error = parse_spreadsheet(file)
    assert headers is None
    assert "must be a .csv or .xlsx" in error


def test_parse_spreadsheet_requires_header_and_data_row(app):
    file = _csv_file("Name,SKU\n")
    headers, rows, error = parse_spreadsheet(file)
    assert headers is None
    assert "header row and at least one data row" in error


def test_parse_spreadsheet_reads_csv_rows(app):
    file = _csv_file(
        "Product Name,SKU Code,Qty,Price\n"
        "Widget,W-1,10,9.99\n"
        "Gadget,G-1,5,19.99\n"
    )
    headers, rows, error = parse_spreadsheet(file)
    assert error is None
    assert headers == ["Product Name", "SKU Code", "Qty", "Price"]
    assert len(rows) == 2
    assert rows[0]["Product Name"] == "Widget"
    assert rows[0]["SKU Code"] == "W-1"


def test_parse_spreadsheet_skips_blank_rows(app):
    file = _csv_file(
        "Name,SKU\n"
        "Widget,W-1\n"
        ",\n"
        "Gadget,G-1\n"
    )
    headers, rows, error = parse_spreadsheet(file)
    assert error is None
    assert len(rows) == 2


def test_import_requires_all_required_fields_mapped(app, user):
    rows = [{"Name": "Widget", "SKU": "W-1"}]
    summary, error = import_inventory_items(
        user.id, rows, {"name": "Name", "sku": "SKU"}
    )
    assert summary is None
    assert "quantity" in error


def test_import_creates_items(app, user):
    rows = [
        {"Name": "Widget", "SKU": "W-1", "Qty": "10", "Price": "9.99"},
        {"Name": "Gadget", "SKU": "G-1", "Qty": "5", "Price": "19.99"},
    ]
    mapping = {"name": "Name", "sku": "SKU", "quantity": "Qty", "unit_price": "Price"}

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    assert summary["created"] == 2
    assert summary["skipped_duplicate_skus"] == []
    assert summary["row_errors"] == []

    items = InventoryItem.query.filter_by(user_id=user.id).all()
    assert len(items) == 2
    widget = next(i for i in items if i.sku == "W-1")
    assert widget.quantity == 10
    assert widget.unit_price == 9.99
    assert widget.reorder_level == 10  # default, since not mapped


def test_import_skips_sku_that_already_exists_in_db(app, user, item_without_history):
    # item_without_history has sku "TEST-002"
    rows = [
        {"Name": "Duplicate", "SKU": "TEST-002", "Qty": "1", "Price": "1.00"},
        {"Name": "New Item", "SKU": "NEW-1", "Qty": "1", "Price": "1.00"},
    ]
    mapping = {"name": "Name", "sku": "SKU", "quantity": "Qty", "unit_price": "Price"}

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    assert summary["created"] == 1
    assert summary["skipped_duplicate_skus"] == ["TEST-002"]


def test_import_skips_duplicate_sku_within_same_file(app, user):
    rows = [
        {"Name": "First", "SKU": "DUP-1", "Qty": "1", "Price": "1.00"},
        {"Name": "Second", "SKU": "DUP-1", "Qty": "2", "Price": "2.00"},
    ]
    mapping = {"name": "Name", "sku": "SKU", "quantity": "Qty", "unit_price": "Price"}

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    assert summary["created"] == 1
    assert summary["skipped_duplicate_skus"] == ["DUP-1"]


def test_import_reports_row_errors_for_invalid_numbers(app, user):
    rows = [{"Name": "Widget", "SKU": "W-1", "Qty": "not-a-number", "Price": "9.99"}]
    mapping = {"name": "Name", "sku": "SKU", "quantity": "Qty", "unit_price": "Price"}

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    assert summary["created"] == 0
    assert len(summary["row_errors"]) == 1
    assert summary["row_errors"][0]["row"] == 2


def test_import_reports_row_errors_for_missing_name_or_sku(app, user):
    rows = [{"Name": "", "SKU": "W-1", "Qty": "1", "Price": "1.00"}]
    mapping = {"name": "Name", "sku": "SKU", "quantity": "Qty", "unit_price": "Price"}

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    assert summary["created"] == 0
    assert "Missing name or SKU" in summary["row_errors"][0]["error"]


def test_import_uses_mapped_reorder_level_when_provided(app, user):
    rows = [{"Name": "Widget", "SKU": "W-1", "Qty": "10", "Price": "9.99", "Reorder": "25"}]
    mapping = {
        "name": "Name",
        "sku": "SKU",
        "quantity": "Qty",
        "unit_price": "Price",
        "reorder_level": "Reorder",
    }

    summary, error = import_inventory_items(user.id, rows, mapping)

    assert error is None
    item = InventoryItem.query.filter_by(user_id=user.id, sku="W-1").first()
    assert item.reorder_level == 25
