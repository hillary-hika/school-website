import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    base = os.path.abspath(os.path.dirname(__file__))
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-change-me')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-change-me')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///cheptulel.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_UPLOAD_MB', '5')) * 1024 * 1024
    app.config['UPLOAD_FOLDER'] = os.path.abspath(os.path.join(base, '..', 'uploads'))
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    origins = [x.strip() for x in os.getenv('CORS_ORIGINS','').split(',') if x.strip()]
    CORS(app, resources={r'/api/*': {'origins': origins or '*'}})
    db.init_app(app); jwt.init_app(app)
    from .routes import api
    app.register_blueprint(api, url_prefix='/api')
    with app.app_context():
        db.create_all()
        from .models import User
        if not User.query.filter_by(email=os.getenv('ADMIN_EMAIL','admin@cheptulel.example').lower()).first():
            u=User(email=os.getenv('ADMIN_EMAIL','admin@cheptulel.example').lower(), role='admin')
            u.set_password(os.getenv('ADMIN_PASSWORD','ChangeThisImmediately123!'))
            db.session.add(u); db.session.commit()
    return app
