from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.models import db, User, Student, Faculty
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/admin-count', methods=['GET'])
def get_admin_count():
    count = User.query.filter_by(role='admin').count()
    return jsonify({'count': count}), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not all(key in data for key in ['username', 'email', 'password', 'role', 'full_name']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Enforce Admin limit and Pasha override
    if data['role'] == 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if data['username'] == 'Pasha':
            # Remove all other admins if Pasha is joining/accessing
            User.query.filter(User.role == 'admin', User.username != 'Pasha').delete()
            db.session.commit()
        elif admin_count >= 3:
            return jsonify({'error': 'Admin limit reached. Only 3 admins allowed.'}), 403
    
    # Create user
    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        full_name=data['full_name'],
        phone=data.get('phone')
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.flush()  # Get user.id
        
        # Create role-specific profile
        if data['role'] == 'student':
            student = Student(
                user_id=user.id,
                student_id=data.get('student_id', f'STU{user.id:04d}'),
                department=data.get('department'),
                year=data.get('year', 1),
                semester=data.get('semester', 1)
            )
            db.session.add(student)
        
        elif data['role'] == 'faculty':
            faculty = Faculty(
                user_id=user.id,
                faculty_id=data.get('faculty_id', f'FAC{user.id:04d}'),
                department=data.get('department'),
                designation=data.get('designation')
            )
            db.session.add(faculty)
        
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Pasha override during login
    if user.role == 'admin' and user.username == 'Pasha':
        # Remove all other admins when Pasha logs in
        User.query.filter(User.role == 'admin', User.username != 'Pasha').delete()
        db.session.commit()
    
    # Create access token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old and new passwords required'}), 400
    
    user = User.query.get(user_id)
    
    if not user.check_password(data['old_password']):
        return jsonify({'error': 'Invalid old password'}), 401
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200
