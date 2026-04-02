# Student Portal Management System

A complete full-stack web application for managing academic activities in educational institutions. Built with Flask (Python) backend and modern HTML/CSS/JavaScript frontend.

## 🎯 Features

### User Roles
- **Admin**: Manage students, faculty, courses, and view system analytics
- **Faculty**: Create courses, assignments, mark attendance, and grade students
- **Student**: View courses, submit assignments, check attendance and grades

### Core Modules

#### Authentication & Authorization
- Secure user registration and login
- JWT-based authentication
- Password encryption with bcrypt
- Role-based access control

#### Student Features
- ✅ View enrolled courses
- ✅ View and submit assignments
- ✅ Check attendance records and percentage
- ✅ View grades and performance
- ✅ Receive announcements
- ✅ Manage profile

#### Faculty Features
- ✅ Create and manage courses
- ✅ Create assignments for courses
- ✅ View and grade student submissions
- ✅ Mark student attendance
- ✅ Upload course materials
- ✅ Post announcements
- ✅ View enrolled students

#### Admin Features
- ✅ Manage student and faculty accounts
- ✅ Manage courses and enrollments
- ✅ Assign faculty to courses
- ✅ View system analytics and statistics
- ✅ Post system-wide announcements
- ✅ Department-wise reports
- ✅ Visual dashboards with charts

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0.0
- **Database**: SQLAlchemy with SQLite (easily switchable to PostgreSQL/MySQL)
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: Flask-Bcrypt
- **CORS**: Flask-CORS

### Frontend
- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **UI Framework**: Bootstrap 5.3.0
- **Icons**: Font Awesome 6.4.0
- **Charts**: Chart.js 4.4.0

### Database Schema
- Users (with role-based profiles)
- Students & Faculty
- Courses
- Enrollments
- Assignments & Submissions
- Attendance Records
- Materials
- Announcements

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
cd student_portal
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Initialize the Database with Sample Data

```bash
python init_db.py
```

This will create:
- 1 Admin account
- 3 Faculty accounts
- 20 Student accounts
- 6 Sample courses
- Sample assignments, attendance records, and announcements

### 4. Run the Application

```bash
python app.py
```

The application will start on http://localhost:5000

### 5. Open in Browser

Navigate to http://localhost:5000 in your web browser.

## 🔐 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Faculty Accounts
- **Username**: `faculty1`, `faculty2`, `faculty3`
- **Password**: `faculty123`

### Student Accounts
- **Username**: `student1`, `student2`, ... `student20`
- **Password**: `student123`

## 📁 Project Structure

```
student_portal/
│
├── backend/
│   ├── __init__.py
│   ├── models.py              # Database models
│   ├── auth.py                # Authentication routes
│   ├── student_routes.py      # Student API endpoints
│   ├── faculty_routes.py      # Faculty API endpoints
│   └── admin_routes.py        # Admin API endpoints
│
├── frontend/
│   ├── index.html             # Main HTML file
│   ├── css/
│   │   └── style.css          # Custom styles
│   └── js/
│       ├── api.js             # API client
│       ├── auth.js            # Authentication logic
│       ├── dashboard.js       # Dashboard components
│       └── main.js            # Main application logic
│
├── static/
│   └── uploads/               # File upload directory
│
├── app.py                     # Main Flask application
├── config.py                  # Configuration settings
├── init_db.py                 # Database initialization script
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /change-password` - Change password

### Student (`/api/student`)
- `GET /profile` - Get student profile
- `PUT /profile` - Update profile
- `GET /courses` - Get enrolled courses
- `GET /assignments` - Get assignments
- `POST /submit-assignment` - Submit assignment
- `GET /attendance` - Get attendance records
- `GET /grades` - Get grades
- `GET /announcements` - Get announcements

### Faculty (`/api/faculty`)
- `GET /profile` - Get faculty profile
- `GET /courses` - Get courses taught
- `POST /courses` - Create new course
- `POST /courses/:id/assignments` - Create assignment
- `GET /assignments/:id/submissions` - Get submissions
- `POST /submissions/:id/grade` - Grade submission
- `POST /courses/:id/materials` - Upload material
- `POST /courses/:id/attendance` - Mark attendance
- `GET /courses/:id/students` - Get enrolled students
- `POST /announcements` - Create announcement

### Admin (`/api/admin`)
- `GET /students` - Get all students
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `GET /faculty` - Get all faculty
- `PUT /faculty/:id` - Update faculty
- `DELETE /faculty/:id` - Delete faculty
- `GET /courses` - Get all courses
- `DELETE /courses/:id` - Delete course
- `POST /courses/:id/assign-faculty` - Assign faculty to course
- `POST /enrollments` - Create enrollment
- `DELETE /enrollments/:id` - Delete enrollment
- `GET /analytics` - Get system analytics
- `GET /announcements` - Get all announcements
- `POST /announcements` - Create announcement
- `DELETE /announcements/:id` - Delete announcement

## 📊 Database Schema

### Users Table
- id, username, email, password_hash, role, full_name, phone, created_at

### Students Table
- id, user_id, student_id, department, year, semester

### Faculty Table
- id, user_id, faculty_id, department, designation

### Courses Table
- id, course_code, course_name, description, credits, faculty_id, semester, year

### Enrollments Table
- id, student_id, course_id, enrollment_date, grade

### Assignments Table
- id, course_id, title, description, due_date, max_marks, created_at

### Submissions Table
- id, assignment_id, student_id, file_path, submitted_at, marks, feedback

### Attendance Table
- id, student_id, course_id, date, status

### Materials Table
- id, course_id, title, description, file_path, uploaded_at

### Announcements Table
- id, title, content, author_id, target_role, created_at

## 🎨 Features Breakdown

### Student Dashboard
1. **Overview**: Quick stats, recent assignments, attendance summary
2. **Courses**: View enrolled courses with instructor details
3. **Assignments**: View, submit, and check grades
4. **Attendance**: View attendance percentage per course
5. **Grades**: Detailed grade breakdown
6. **Announcements**: Important updates
7. **Profile**: View and edit personal information

### Faculty Dashboard
1. **Courses**: Create and manage courses
2. **Assignments**: Create assignments and grade submissions
3. **Attendance**: Mark daily attendance
4. **Students**: View enrolled students
5. **Materials**: Upload course materials
6. **Announcements**: Post updates for students

### Admin Dashboard
1. **Analytics**: Visual charts and statistics
2. **Student Management**: Add, edit, delete students
3. **Faculty Management**: Manage faculty accounts
4. **Course Management**: Oversee all courses
5. **Enrollments**: Manage student-course enrollments
6. **Reports**: Department-wise, year-wise reports
7. **Announcements**: System-wide communications

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection

## 🎯 Usage Examples

### Registering a New Student

```javascript
POST /api/auth/register
{
  "username": "newstudent",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "full_name": "John Doe",
  "department": "Computer Science",
  "year": 2
}
```

### Creating a Course (Faculty)

```javascript
POST /api/faculty/courses
Headers: { Authorization: "Bearer <token>" }
{
  "course_code": "CS301",
  "course_name": "Database Systems",
  "description": "Introduction to databases",
  "credits": 4,
  "semester": 1
}
```

### Submitting an Assignment (Student)

```javascript
POST /api/student/submit-assignment
Headers: { Authorization: "Bearer <token>" }
{
  "assignment_id": 1,
  "file_path": "/uploads/assignment1.pdf"
}
```

## 📈 Future Enhancements

- Real-time notifications using WebSockets
- Email notifications for assignments and announcements
- File upload functionality for assignments
- PDF report generation
- Timetable management
- Fee management
- Library management
- Exam management
- Mobile responsive improvements
- Dark mode theme

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors:
```bash
# Delete the old database
rm student_portal.db

# Reinitialize
python init_db.py
```

### Port Already in Use
If port 5000 is busy:
```python
# In app.py, change:
app.run(debug=True, host='0.0.0.0', port=5001)
```

### CORS Errors
Ensure Flask-CORS is properly installed:
```bash
pip install Flask-CORS
```

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Developer

Built as a comprehensive student portal management system demonstration.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

## 📧 Support

For issues and questions, please refer to the troubleshooting section or create an issue in the repository.

---

**Happy Learning! 🎓**
