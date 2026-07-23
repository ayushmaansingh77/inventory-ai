import pytest
from datetime import date, timedelta
from app import create_app, db
from app.models.user import User
from app.models.inventory import InventoryItem
from app.models.sales_record import SalesRecord
import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

@pytest.fixture
def app():
    app = create_app()
   
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def user(app):
    u = User(username="testuser", email="test@example.com", is_verified=True)
    u.set_password("testpass123")
    db.session.add(u)
    db.session.commit()
    return u


@pytest.fixture
def item_with_history(app, user):
    item = InventoryItem(
        name="Test Widget",
        sku="TEST-001",
        quantity=5,
        unit_price=9.99,
        reorder_level=20,
        user_id=user.id,
    )
    db.session.add(item)
    db.session.commit()

    start = date.today() - timedelta(days=90)
    for i in range(90):
        record = SalesRecord(
            item_id=item.id,
            date=start + timedelta(days=i),
            quantity_sold=5 + (i % 7),
        )
        db.session.add(record)
    db.session.commit()

    return item


@pytest.fixture
def item_without_history(app, user):
    item = InventoryItem(
        name="New Widget",
        sku="TEST-002",
        quantity=5,
        unit_price=9.99,
        reorder_level=20,
        user_id=user.id,
    )
    db.session.add(item)
    db.session.commit()
    return item