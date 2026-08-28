import os
from app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()   # creates tables in PostgreSQL if they don't exist
        print("!!! Database tables created")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production").lower() == "development"
    app.run(host="0.0.0.0", debug=debug, port=port)