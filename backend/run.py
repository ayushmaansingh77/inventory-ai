from app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()   # creates tables in PostgreSQL if they don't exist
        print("✅ Database tables created")
    app.run(debug=True, port=5000)