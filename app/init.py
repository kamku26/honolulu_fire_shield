from flask import Flask
from app.routes import configure_routes


def create_app():
    app = Flask(__name__)
    app.secret_key = "your_secret_key"

    from app.routes import configure_routes
    configure_routes(app)

    return app