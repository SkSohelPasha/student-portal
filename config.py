import os
from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key')
    
    # Use /tmp for SQLite on Vercel to allow temporary writes
    if os.environ.get('VERCEL'):
        SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:////tmp/student_portal.db')
        UPLOAD_FOLDER = '/tmp/uploads'
    else:
        SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', f'sqlite:///{os.path.join(basedir, "student_portal.db")}')
        UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
