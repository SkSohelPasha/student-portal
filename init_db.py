from app import create_app
from backend.models import db, User, Student, Faculty, Course, Enrollment, Assignment, Submission, Attendance, Announcement
from datetime import datetime, timedelta
import random

def init_database():
    app = create_app()
    
    with app.app_context():
        # Drop all tables and recreate
        print("Creating database tables...")
        db.drop_all()
        db.create_all()
        
        # Create Admin
        print("Creating admin user...")
        admin = User(
            username='admin',
            email='admin@portal.com',
            role='admin',
            full_name='System Administrator',
            phone='1234567890'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create Faculty members
        print("Creating faculty members...")
        faculty_data = [
            {'username': 'faculty1', 'email': 'john.doe@portal.com', 'name': 'Dr. John Doe', 'dept': 'Computer Science', 'designation': 'Professor'},
            {'username': 'faculty2', 'email': 'jane.smith@portal.com', 'name': 'Dr. Jane Smith', 'dept': 'Mathematics', 'designation': 'Associate Professor'},
            {'username': 'faculty3', 'email': 'bob.wilson@portal.com', 'name': 'Dr. Bob Wilson', 'dept': 'Physics', 'designation': 'Assistant Professor'},
        ]
        
        faculty_profiles = []
        for i, fac_data in enumerate(faculty_data, 1):
            user = User(
                username=fac_data['username'],
                email=fac_data['email'],
                role='faculty',
                full_name=fac_data['name'],
                phone=f'98765432{i:02d}'
            )
            user.set_password('faculty123')
            db.session.add(user)
            db.session.flush()
            
            faculty = Faculty(
                user_id=user.id,
                faculty_id=f'FAC{i:04d}',
                department=fac_data['dept'],
                designation=fac_data['designation']
            )
            db.session.add(faculty)
            faculty_profiles.append(faculty)
        
        db.session.flush()
        
        # Create Students
        print("Creating students...")
        departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']
        student_profiles = []
        
        for i in range(1, 21):  # 20 students
            user = User(
                username=f'student{i}',
                email=f'student{i}@portal.com',
                role='student',
                full_name=f'Student {i}',
                phone=f'55512345{i:02d}'
            )
            user.set_password('student123')
            db.session.add(user)
            db.session.flush()
            
            student = Student(
                user_id=user.id,
                student_id=f'STU{i:04d}',
                department=random.choice(departments),
                year=random.randint(1, 4),
                semester=random.randint(1, 8)
            )
            db.session.add(student)
            student_profiles.append(student)
        
        db.session.flush()
        
        # Create Courses
        print("Creating courses...")
        courses_data = [
            {'code': 'CS101', 'name': 'Introduction to Programming', 'credits': 4, 'faculty_idx': 0},
            {'code': 'CS201', 'name': 'Data Structures', 'credits': 4, 'faculty_idx': 0},
            {'code': 'MATH101', 'name': 'Calculus I', 'credits': 3, 'faculty_idx': 1},
            {'code': 'MATH201', 'name': 'Linear Algebra', 'credits': 3, 'faculty_idx': 1},
            {'code': 'PHY101', 'name': 'Physics I', 'credits': 4, 'faculty_idx': 2},
            {'code': 'PHY201', 'name': 'Quantum Mechanics', 'credits': 4, 'faculty_idx': 2},
        ]
        
        courses = []
        for course_data in courses_data:
            course = Course(
                course_code=course_data['code'],
                course_name=course_data['name'],
                description=f'This is a comprehensive course on {course_data["name"]}',
                credits=course_data['credits'],
                faculty_id=faculty_profiles[course_data['faculty_idx']].id,
                semester=1,
                year=2026
            )
            db.session.add(course)
            courses.append(course)
        
        db.session.flush()
        
        # Create Enrollments
        print("Creating enrollments...")
        for student in student_profiles:
            # Enroll each student in 3-5 random courses
            num_courses = random.randint(3, 5)
            enrolled_courses = random.sample(courses, num_courses)
            
            for course in enrolled_courses:
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id
                )
                db.session.add(enrollment)
        
        db.session.flush()
        
        # Create Assignments
        print("Creating assignments...")
        assignments = []
        for course in courses:
            for i in range(1, 4):  # 3 assignments per course
                assignment = Assignment(
                    course_id=course.id,
                    title=f'{course.course_name} - Assignment {i}',
                    description=f'Complete the assignment {i} for {course.course_name}',
                    due_date=datetime.now() + timedelta(days=random.randint(7, 30)),
                    max_marks=100
                )
                db.session.add(assignment)
                assignments.append(assignment)
        
        db.session.flush()
        
        # Create some Submissions
        print("Creating submissions...")
        for assignment in assignments[:10]:  # Sample submissions for first 10 assignments
            enrollments = Enrollment.query.filter_by(course_id=assignment.course_id).all()
            
            for enrollment in enrollments[:5]:  # First 5 students submit
                submission = Submission(
                    assignment_id=assignment.id,
                    student_id=enrollment.student_id,
                    file_path=f'/uploads/assignment_{assignment.id}_student_{enrollment.student_id}.pdf',
                    marks=random.randint(60, 100),
                    feedback='Good work!' if random.random() > 0.5 else 'Needs improvement.'
                )
                db.session.add(submission)
        
        db.session.flush()
        
        # Create Attendance records
        print("Creating attendance records...")
        today = datetime.now().date()
        for course in courses:
            enrollments = Enrollment.query.filter_by(course_id=course.id).all()
            
            # Create attendance for last 10 days
            for day in range(10):
                date = today - timedelta(days=day)
                
                for enrollment in enrollments:
                    status = 'present' if random.random() > 0.2 else 'absent'  # 80% attendance
                    attendance = Attendance(
                        student_id=enrollment.student_id,
                        course_id=course.id,
                        date=date,
                        status=status
                    )
                    db.session.add(attendance)
        
        db.session.flush()
        
        # Create Announcements
        print("Creating announcements...")
        announcements_data = [
            {'title': 'Welcome to Student Portal', 'content': 'Welcome to the new academic year! Please check your courses and schedules.', 'target': 'all'},
            {'title': 'Exam Schedule Released', 'content': 'Mid-term examination schedule has been released. Check your dashboard.', 'target': 'student'},
            {'title': 'Faculty Meeting', 'content': 'All faculty members are requested to attend the meeting on Monday.', 'target': 'faculty'},
            {'title': 'Library Hours Extended', 'content': 'Library will now be open until 10 PM during exam week.', 'target': 'all'},
        ]
        
        for ann_data in announcements_data:
            announcement = Announcement(
                title=ann_data['title'],
                content=ann_data['content'],
                author_id=admin.id,
                target_role=ann_data['target']
            )
            db.session.add(announcement)
        
        # Commit all changes
        db.session.commit()
        
        print("\n" + "="*50)
        print("Database initialized successfully!")
        print("="*50)
        print("\nSample Login Credentials:")
        print("\nAdmin:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nFaculty:")
        print("  Username: faculty1, faculty2, faculty3")
        print("  Password: faculty123")
        print("\nStudent:")
        print("  Username: student1, student2, ... student20")
        print("  Password: student123")
        print("="*50)

if __name__ == '__main__':
    init_database()
