from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from backend.models import db
from backend.auth import auth_bp
from backend.student_routes import student_bp
from backend.faculty_routes import faculty_bp
from backend.admin_routes import admin_bp
import os

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Custom JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            'error': 'Unauthorized',
            'msg': 'Missing Authorization Header'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            'error': 'Unauthorized',
            'msg': 'Invalid token'
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            'error': 'Unauthorized',
            'msg': 'Token has expired'
        }), 401

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(admin_bp)
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Check if database file exists, create tables if not
    # On Vercel, we might need to handle the read-only file system
    # but for common deployments, we'll try to create tables in the current folder or temp
    with app.app_context():
        try:
            db.create_all()
            print("Database checked/created successfully!")
        except Exception as e:
            print(f"Database creation error (expected on some read-only hosts): {e}")

    # Serve frontend
    basedir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(basedir, 'frontend')

    @app.route('/')
    def index():
        return send_from_directory(frontend_dir, 'index.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    print("Student Portal Management System is running...")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)
