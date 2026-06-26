from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
import os

#extensions 
db = SQLAlchemy()
jwt = JWTManager()
bcrypt=Bcrypt()

def create_app():
    load_dotenv()  # read form evn file

    app = Flask(__name__)

    #config form env variables
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Attach extensions to this app instance
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app) #sort of middleware
    # Register blueprints (routes)
    with app.app_context():
        from app.models.user import User
        from app.models.inventory import InventoryItem
    from app.routes.health import health_bp
    from app.routes.auth import auth_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)

    return app