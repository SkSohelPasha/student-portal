from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, User, Student, Faculty, Course, Enrollment, Assignment, Submission, Announcement, Attendance
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def require_admin():
    """Check if user is admin"""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True
@admin_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'profile': user.to_dict()}), 200

# Student Management
@admin_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    students = Student.query.all()
    
    return jsonify({
        'students': [student.to_dict() for student in students]
    }), 200

@admin_bp.route('/students/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    user = student.user
    db.session.delete(student)
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Student deleted successfully'}), 200

@admin_bp.route('/students/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    data = request.get_json()
    user = student.user
    
    # Update user info
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    
    # Update student info
    if 'department' in data:
        student.department = data['department']
    if 'year' in data:
        student.year = data['year']
    if 'semester' in data:
        student.semester = data['semester']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Student updated successfully',
        'student': student.to_dict()
    }), 200

# Faculty Management
@admin_bp.route('/faculty', methods=['GET'])
@jwt_required()
def get_faculty():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    faculty = Faculty.query.all()
    
    return jsonify({
        'faculty': [f.to_dict() for f in faculty]
    }), 200

@admin_bp.route('/faculty/<int:faculty_id>', methods=['DELETE'])
@jwt_required()
def delete_faculty(faculty_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    faculty = Faculty.query.get(faculty_id)
    if not faculty:
        return jsonify({'error': 'Faculty not found'}), 404
    
    user = faculty.user
    db.session.delete(faculty)
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Faculty deleted successfully'}), 200

@admin_bp.route('/faculty/<int:faculty_id>', methods=['PUT'])
@jwt_required()
def update_faculty(faculty_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    faculty = Faculty.query.get(faculty_id)
    if not faculty:
        return jsonify({'error': 'Faculty not found'}), 404
    
    data = request.get_json()
    user = faculty.user
    
    # Update user info
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    
    # Update faculty info
    if 'department' in data:
        faculty.department = data['department']
    if 'designation' in data:
        faculty.designation = data['designation']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Faculty updated successfully',
        'faculty': faculty.to_dict()
    }), 200

# Course Management
@admin_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    courses = Course.query.all()
    
    return jsonify({
        'courses': [course.to_dict() for course in courses]
    }), 200

@admin_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted successfully'}), 200

@admin_bp.route('/courses/<int:course_id>/assign-faculty', methods=['POST'])
@jwt_required()
def assign_faculty_to_course(course_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    data = request.get_json()
    faculty_id = data.get('faculty_id')
    
    if not faculty_id:
        return jsonify({'error': 'Faculty ID required'}), 400
    
    faculty = Faculty.query.get(faculty_id)
    if not faculty:
        return jsonify({'error': 'Faculty not found'}), 404
    
    course.faculty_id = faculty_id
    db.session.commit()
    
    return jsonify({
        'message': 'Faculty assigned successfully',
        'course': course.to_dict()
    }), 200

# Enrollment Management
@admin_bp.route('/enrollments', methods=['POST'])
@jwt_required()
def create_enrollment():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if not all(key in data for key in ['student_id', 'course_id']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if already enrolled
    existing = Enrollment.query.filter_by(
        student_id=data['student_id'],
        course_id=data['course_id']
    ).first()
    
    if existing:
        return jsonify({'error': 'Student already enrolled in this course'}), 400
    
    enrollment = Enrollment(
        student_id=data['student_id'],
        course_id=data['course_id']
    )
    
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({
        'message': 'Enrollment created successfully',
        'enrollment': enrollment.to_dict()
    }), 201

@admin_bp.route('/enrollments/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def delete_enrollment(enrollment_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    enrollment = Enrollment.query.get(enrollment_id)
    if not enrollment:
        return jsonify({'error': 'Enrollment not found'}), 404
    
    db.session.delete(enrollment)
    db.session.commit()
    
    return jsonify({'message': 'Enrollment deleted successfully'}), 200

# Analytics
@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    # Count statistics
    total_students = Student.query.count()
    total_faculty = Faculty.query.count()
    total_courses = Course.query.count()
    total_assignments = Assignment.query.count()
    
    # Department-wise student count
    dept_stats = db.session.query(
        Student.department,
        func.count(Student.id)
    ).group_by(Student.department).all()
    
    department_distribution = [
        {'department': dept or 'Not Assigned', 'count': count}
        for dept, count in dept_stats
    ]
    
    # Year-wise student count
    year_stats = db.session.query(
        Student.year,
        func.count(Student.id)
    ).group_by(Student.year).all()
    
    year_distribution = [
        {'year': year or 0, 'count': count}
        for year, count in year_stats
    ]
    
    # Course enrollment count
    course_stats = db.session.query(
        Course.course_name,
        func.count(Enrollment.id)
    ).join(Enrollment).group_by(Course.id, Course.course_name).all()
    
    course_enrollment = [
        {'course': course, 'enrollments': count}
        for course, count in course_stats
    ]
    
    # Submission statistics
    total_submissions = Submission.query.count()
    graded_submissions = Submission.query.filter(Submission.marks.isnot(None)).count()
    
    return jsonify({
        'overview': {
            'total_students': total_students,
            'total_faculty': total_faculty,
            'total_courses': total_courses,
            'total_assignments': total_assignments,
            'total_submissions': total_submissions,
            'graded_submissions': graded_submissions
        },
        'department_distribution': department_distribution,
        'year_distribution': year_distribution,
        'course_enrollment': course_enrollment
    }), 200

# Announcements
@admin_bp.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not all(key in data for key in ['title', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    announcement = Announcement(
        title=data['title'],
        content=data['content'],
        author_id=user_id,
        target_role=data.get('target_role', 'all')
    )
    
    db.session.add(announcement)
    db.session.commit()
    
    return jsonify({
        'message': 'Announcement created successfully',
        'announcement': announcement.to_dict()
    }), 201

@admin_bp.route('/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    
    return jsonify({
        'announcements': [a.to_dict() for a in announcements]
    }), 200

@admin_bp.route('/announcements/<int:announcement_id>', methods=['DELETE'])
@jwt_required()
def delete_announcement(announcement_id):
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404
    
    db.session.delete(announcement)
    db.session.commit()
    
    return jsonify({'message': 'Announcement deleted successfully'}), 200

@admin_bp.route('/assignments', methods=['GET'])
@jwt_required()
def get_assignments():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    assignments = Assignment.query.all()
    
    return jsonify({
        'assignments': [a.to_dict() for a in assignments]
    }), 200

# Attendance & Results for Admin
@admin_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_all_attendance():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    records = Attendance.query.all()
    
    attendance_list = []
    for r in records:
        try:
            student = r.student
            course = r.course
            user = student.user if student else None
            
            attendance_list.append({
                'id': r.id,
                'student_id': student.student_id if student else 'N/A',
                'student_name': user.full_name if user else 'Unknown',
                'department': student.department if student else 'N/A',
                'year': student.year if student else 'N/A',
                'course': course.course_name if course else 'Unknown Course',
                'date': r.date.isoformat() if r.date else 'N/A',
                'status': r.status
            })
        except Exception as e:
            print(f"Error processing attendance record {r.id}: {str(e)}")
            continue

    return jsonify({
        'attendance': attendance_list
    }), 200

@admin_bp.route('/results', methods=['GET'])
@jwt_required()
def get_all_results():
    if not require_admin():
        return jsonify({'error': 'Access denied'}), 403
    
    enrollments = Enrollment.query.all()
    
    results_list = []
    for e in enrollments:
        student = e.student
        course = e.course
        user = student.user if student else None
        
        if not student or not course:
            continue
            
        # Get assignments for this course
        assignments = Assignment.query.filter_by(course_id=course.id).all()
        
        marks_summary = []
        is_fully_submitted = True
        
        if assignments:
            for assignment in assignments:
                submission = Submission.query.filter_by(
                    assignment_id=assignment.id,
                    student_id=student.id
                ).first()
                
                if submission:
                    marks_summary.append({
                        'title': assignment.title,
                        'marks': submission.marks,
                        'max': assignment.max_marks,
                        'status': 'Submitted'
                    })
                else:
                    is_fully_submitted = False
                    marks_summary.append({
                        'title': assignment.title,
                        'marks': None,
                        'max': assignment.max_marks,
                        'status': 'Not Submitted'
                    })
        
        results_list.append({
            'id': e.id,
            'student_id': student.student_id,
            'student_name': user.full_name if user else 'Unknown',
            'course_name': course.course_name,
            'course_code': course.course_code,
            'grade': e.grade or 'N/A',
            'assignments': marks_summary
        })
    
    return jsonify({
        'results': results_list
    }), 200

