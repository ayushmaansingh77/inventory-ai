from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

import os

#extensions 
db = SQLAlchemy()
jwt = JWTManager()
bcrypt=Bcrypt()
migrate=Migrate()#to create tabel we userd create_all for the first table as a short cut

def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    CORS(app)

    with app.app_context():
        from app.models.user import User
        from app.models.inventory import InventoryItem
        from app.models.sales_record import SalesRecord
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    from app.routes.inventory import inventory_bp       
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(inventory_bp)               
    return app