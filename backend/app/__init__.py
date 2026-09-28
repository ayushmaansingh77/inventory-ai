from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import os

#extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt=Bcrypt()
migrate=Migrate()#to create tabel we userd create_all for the first table as a short cut
mail = Mail()
# in-memory limiter store: fine for a single-process demo deployment; a real
# multi-worker deployment would point storage_uri at Redis instead.
limiter = Limiter(key_func=get_remote_address)
def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 2525))
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_USE_TLS"] = True
    # Flask-Mail bakes its suppress-send flag into a state object at
    # mail.init_app() time (below), so setting app.config["TESTING"] = True
    # *after* create_app() returns (as tests previously did) has no effect
    # on whether mail actually goes out. Read this from the environment
    # instead, so conftest.py can suppress it before create_app() runs.
    app.config["MAIL_SUPPRESS_SEND"] = os.getenv("MAIL_SUPPRESS_SEND", "false").lower() == "true"
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB cap, mainly for spreadsheet imports

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    with app.app_context():
        from app.models.user import User
        from app.models.inventory import InventoryItem
        from app.models.sales_record import SalesRecord
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.inventory import inventory_bp
    from app.routes.import_routes import import_bp
    from app.routes.export_routes import export_bp
    from app.routes.alert_routes import alert_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(import_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(alert_bp)
    return app