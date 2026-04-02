from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, User, Course, Assignment, Material, Attendance, Submission, Announcement, Enrollment, Student
from datetime import datetime
from sqlalchemy import func

faculty_bp = Blueprint('faculty', __name__, url_prefix='/api/faculty')

def require_faculty():
    """Check if user is faculty"""
    claims = get_jwt()
    if claims.get('role') != 'faculty':
        return False
    return True

@faculty_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    from backend.models import Student, Faculty
    
    total_students = Student.query.count()
    total_faculty = Faculty.query.count()
    
    return jsonify({
        'total_students': total_students,
        'total_faculty': total_faculty,
        'active_semester': 'Spring 2026'
    }), 200

@faculty_bp.route('/students', methods=['GET'])
@jwt_required()
def get_all_students_for_faculty():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    from backend.models import Student
    students = Student.query.all()
    
    return jsonify({
        'students': [s.to_dict() for s in students]
    }), 200

@faculty_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.faculty_profile:
        return jsonify({'error': 'Faculty profile not found'}), 404
    
    return jsonify({'profile': user.faculty_profile.to_dict()}), 200

@faculty_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    courses = Course.query.filter_by(faculty_id=faculty.id).all()
    
    return jsonify({
        'courses': [course.to_dict() for course in courses]
    }), 200

@faculty_bp.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    data = request.get_json()
    
    if not all(key in data for key in ['course_code', 'course_name']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if course code already exists
    if Course.query.filter_by(course_code=data['course_code']).first():
        return jsonify({'error': 'Course code already exists'}), 400
    
    course = Course(
        course_code=data['course_code'],
        course_name=data['course_name'],
        description=data.get('description'),
        credits=data.get('credits', 3),
        faculty_id=faculty.id,
        semester=data.get('semester', 1),
        year=data.get('year', datetime.now().year)
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'message': 'Course created successfully',
        'course': course.to_dict()
    }), 201

@faculty_bp.route('/courses/<int:course_id>/assignments', methods=['POST'])
@jwt_required()
def create_assignment(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
    
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Title required'}), 400
    
    # Parse due date
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'])
        except ValueError:
            return jsonify({'error': 'Invalid due_date format, expected ISO 8601'}), 400
    
    assignment = Assignment(
        course_id=course_id,
        title=data['title'],
        description=data.get('description'),
        due_date=due_date,
        max_marks=data.get('max_marks', 100)
    )
    
    db.session.add(assignment)
    db.session.commit()
    
    return jsonify({
        'message': 'Assignment created successfully',
        'assignment': assignment.to_dict()
    }), 201
@faculty_bp.route('/assignments', methods=['GET'])
@jwt_required()
def get_all_assignments():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course_ids = [c.id for c in faculty.courses]
    assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).all()
    
    return jsonify({
        'assignments': [a.to_dict() for a in assignments]
    }), 200

@faculty_bp.route('/courses/<int:course_id>/assignments', methods=['GET'])
@jwt_required()
def get_course_assignments(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
    
    assignments = Assignment.query.filter_by(course_id=course_id).all()
    
    return jsonify({
        'assignments': [a.to_dict() for a in assignments]
    }), 200

@faculty_bp.route('/assignments/<int:assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions(assignment_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    assignment = Assignment.query.get(assignment_id)
    if not assignment or assignment.course.faculty_id != faculty.id:
        return jsonify({'error': 'Assignment not found or unauthorized'}), 404
    
    submissions = Submission.query.filter_by(assignment_id=assignment_id).all()
    
    return jsonify({
        'submissions': [s.to_dict() for s in submissions]
    }), 200

@faculty_bp.route('/submissions/<int:submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission(submission_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    submission = Submission.query.get(submission_id)
    if not submission or submission.assignment.course.faculty_id != faculty.id:
        return jsonify({'error': 'Submission not found or unauthorized'}), 404
    
    data = request.get_json()
    
    if 'marks' not in data:
        return jsonify({'error': 'Marks required'}), 400
    
    submission.marks = data['marks']
    submission.feedback = data.get('feedback', '')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Submission graded successfully',
        'submission': submission.to_dict()
    }), 200

@faculty_bp.route('/courses/<int:course_id>/materials', methods=['POST'])
@jwt_required()
def upload_material(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
    
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Title required'}), 400
    
    material = Material(
        course_id=course_id,
        title=data['title'],
        description=data.get('description'),
        file_path=data.get('file_path', '')
    )
    
    db.session.add(material)
    db.session.commit()
    
    return jsonify({
        'message': 'Material uploaded successfully',
        'material': material.to_dict()
    }), 201

@faculty_bp.route('/courses/<int:course_id>/attendance', methods=['POST'])
@jwt_required()
def mark_attendance(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
    
    data = request.get_json()
    
    if not data.get('attendance_records'):
        return jsonify({'error': 'Attendance records required'}), 400
    
    # Parse date and time
    dt_obj = datetime.now()
    if data.get('date'):
        try:
            dt_obj = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid datetime format, expected ISO 8601'}), 400
    
    # Mark attendance for each student
    for record in data['attendance_records']:
        student_id = record.get('student_id')
        status = record.get('status')
        
        # Check if already marked on this specific date (ignoring time)
        # Using a range check (00:00:00 to 23:59:59) is more robust for SQLite
        start_of_day = datetime(dt_obj.year, dt_obj.month, dt_obj.day, 0, 0, 0)
        end_of_day = datetime(dt_obj.year, dt_obj.month, dt_obj.day, 23, 59, 59)
        
        existing = Attendance.query.filter(
            Attendance.student_id == student_id,
            Attendance.course_id == course_id,
            Attendance.date >= start_of_day,
            Attendance.date <= end_of_day
        ).first()
        
        if existing:
            existing.status = status
            existing.date = dt_obj
        else:
            attendance = Attendance(
                student_id=student_id,
                course_id=course_id,
                date=dt_obj,
                status=status
            )
            db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({'message': 'Attendance marked successfully'}), 200

@faculty_bp.route('/courses/<int:course_id>/students', methods=['GET'])
@jwt_required()
def get_course_students(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
    
    # Auto-enrollment logic: automatically enroll all system students to this course
    all_students = Student.query.all()
    existing_enrollments = list(Enrollment.query.filter_by(course_id=course_id).all())
    existing_student_ids = {e.student_id for e in existing_enrollments}
    
    new_enrollments = []
    for s in all_students:
        if s.id not in existing_student_ids:
            e = Enrollment(student_id=s.id, course_id=course_id)
            db.session.add(e)
            new_enrollments.append(e)
            
    if new_enrollments:
        db.session.commit()
        existing_enrollments.extend(new_enrollments)
    
    students = []
    for enrollment in existing_enrollments:
        student_data = enrollment.student.to_dict()
        student_data['enrollment'] = {
            'id': enrollment.id,
            'enrollment_date': enrollment.enrollment_date.isoformat() if enrollment.enrollment_date else None,
            'grade': enrollment.grade
        }
        students.append(student_data)
    
    return jsonify({'students': students}), 200

@faculty_bp.route('/courses/<int:course_id>/gradebook', methods=['GET'])
@jwt_required()
def get_gradebook(course_id):
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    faculty = user.faculty_profile
    
    course = Course.query.get(course_id)
    if not course or course.faculty_id != faculty.id:
        return jsonify({'error': 'Course not found or unauthorized'}), 404
        
    try:
        # Get all assignments for this course
        assignments = Assignment.query.filter_by(course_id=course_id).all()
        
        # Get all students enrolled in this course
        enrollments = Enrollment.query.filter_by(course_id=course_id).all()
        
        students_data = []
        for enrollment in enrollments:
            student = enrollment.student
            if not student: continue
            
            user = student.user
            results = []
            for assignment in assignments:
                submission = Submission.query.filter_by(
                    assignment_id=assignment.id,
                    student_id=student.id
                ).first()
                
                results.append({
                    'assignment_id': assignment.id,
                    'assignment_title': assignment.title,
                    'max_marks': assignment.max_marks,
                    'marks': submission.marks if submission else None,
                    'status': 'Submitted' if (submission and submission.submitted_at) else 'Not Submitted'
                })
                
            students_data.append({
                'student_id': student.student_id,
                'full_name': user.full_name if user else 'Unknown Student',
                'results': results
            })
            
        return jsonify({
            'course_name': course.course_name,
            'assignments': [a.to_dict() for a in assignments],
            'students': students_data
        }), 200
    except Exception as e:
        print(f"Error in get_gradebook: {str(e)}")
        return jsonify({'error': 'Failed to generate gradebook', 'details': str(e)}), 500

@faculty_bp.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not all(key in data for key in ['title', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    announcement = Announcement(
        title=data['title'],
        content=data['content'],
        author_id=user_id,
        target_role=data.get('target_role', 'student')
    )
    
    db.session.add(announcement)
    db.session.commit()
    
    return jsonify({
        'message': 'Announcement created successfully',
        'announcement': announcement.to_dict()
    }), 201

@faculty_bp.route('/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    if not require_faculty():
        return jsonify({'error': 'Access denied'}), 403
    
    announcements = Announcement.query.filter(
        (Announcement.target_role == 'faculty') | (Announcement.target_role == 'all')
    ).order_by(Announcement.created_at.desc()).all()
    
    return jsonify({
        'announcements': [a.to_dict() for a in announcements]
    }), 200
