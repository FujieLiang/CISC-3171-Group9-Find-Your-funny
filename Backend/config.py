from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, "frontend", "build")

app = Flask(
    __name__,
    template_folder=FRONTEND_BUILD_DIR,
    static_folder=os.path.join(FRONTEND_BUILD_DIR, "static"),
    static_url_path="/static",
)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")

CORS(app)
database = SQLAlchemy(app)

