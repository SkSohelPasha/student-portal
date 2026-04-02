from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, User, Enrollment, Submission, Attendance, Assignment, Announcement

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

def require_student():
    """Decorator to check if user is a student"""
    claims = get_jwt()
    if claims.get('role') != 'student':
        return False
    return True

@student_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.student_profile:
        return jsonify({'error': 'Student profile not found'}), 404
    
    return jsonify({'profile': user.student_profile.to_dict()}), 200

@student_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    # Update user info
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    # Update student info
    student = user.student_profile
    if 'department' in data:
        student.department = data['department']
    if 'year' in data:
        student.year = data['year']
    if 'semester' in data:
        student.semester = data['semester']
    
    db.session.commit()
    
    return jsonify({'message': 'Profile updated', 'profile': student.to_dict()}), 200

@student_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = user.student_profile
    
    from backend.models import Course, Enrollment
    
    # Auto-enrollment logic for newly registered students to all existing courses
    all_courses = Course.query.all()
    existing_enrollments = list(Enrollment.query.filter_by(student_id=student.id).all())
    existing_course_ids = {e.course_id for e in existing_enrollments}
    
    new_enrollments = []
    for c in all_courses:
        if c.id not in existing_course_ids:
            e = Enrollment(student_id=student.id, course_id=c.id)
            db.session.add(e)
            new_enrollments.append(e)
            
    if new_enrollments:
        db.session.commit()
        existing_enrollments.extend(new_enrollments)
    
    return jsonify({
        'courses': [enrollment.to_dict() for enrollment in existing_enrollments]
    }), 200

@student_bp.route('/assignments', methods=['GET'])
@jwt_required()
def get_assignments():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = user.student_profile
    
    # Get all assignments for enrolled courses
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    
    # Check submission status
    result = []
    for assignment in assignments:
        assignment_dict = assignment.to_dict()
        submission = Submission.query.filter_by(
            assignment_id=assignment.id,
            student_id=student.id
        ).first()
        assignment_dict['submission'] = submission.to_dict() if submission else None
        result.append(assignment_dict)
    
    return jsonify({'assignments': result}), 200

@student_bp.route('/submit-assignment', methods=['POST'])
@jwt_required()
def submit_assignment():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = user.student_profile
    data = request.get_json()
    
    if not data.get('assignment_id'):
        return jsonify({'error': 'Assignment ID required'}), 400
    
    # Check if already submitted
    existing = Submission.query.filter_by(
        assignment_id=data['assignment_id'],
        student_id=student.id
    ).first()
    
    if existing:
        return jsonify({'error': 'Assignment already submitted'}), 400
    
    submission = Submission(
        assignment_id=data['assignment_id'],
        student_id=student.id,
        file_path=data.get('file_path', '')
    )
    
    db.session.add(submission)
    db.session.commit()
    
    return jsonify({
        'message': 'Assignment submitted successfully',
        'submission': submission.to_dict()
    }), 201

@student_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = user.student_profile
    
    # Get attendance records
    records = Attendance.query.filter_by(student_id=student.id).all()
    
    # Calculate attendance percentage per course
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    attendance_summary = []
    
    for enrollment in enrollments:
        course_records = [r for r in records if r.course_id == enrollment.course_id]
        total = len(course_records)
        present = len([r for r in course_records if r.status == 'present'])
        percentage = (present / total * 100) if total > 0 else 0
        
        attendance_summary.append({
            'course': enrollment.course.to_dict(),
            'total_classes': total,
            'attended': present,
            'percentage': round(percentage, 2)
        })
    
    return jsonify({
        'attendance': [r.to_dict() for r in records],
        'summary': attendance_summary
    }), 200

@student_bp.route('/grades', methods=['GET'])
@jwt_required()
def get_grades():
    if not require_student():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    student = user.student_profile
    
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    
    grades = []
    for enrollment in enrollments:
        # Get assignment grades
        submissions = Submission.query.filter_by(
            student_id=student.id
        ).join(Assignment).filter(
            Assignment.course_id == enrollment.course_id
        ).all()
        
        total_marks = sum([s.marks for s in submissions if s.marks])
        max_marks = sum([s.assignment.max_marks for s in submissions])
        
        grades.append({
            'course': enrollment.course.to_dict(),
            'final_grade': enrollment.grade,
            'total_marks': total_marks,
            'max_marks': max_marks,
            'percentage': round((total_marks / max_marks * 100) if max_marks > 0 else 0, 2),
            'submissions': [s.to_dict() for s in submissions]
        })
    
    return jsonify({'grades': grades}), 200

@student_bp.route('/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    announcements = Announcement.query.filter(
        (Announcement.target_role == 'student') | (Announcement.target_role == 'all')
    ).order_by(Announcement.created_at.desc()).all()
    
    return jsonify({
        'announcements': [a.to_dict() for a in announcements]
    }), 200
