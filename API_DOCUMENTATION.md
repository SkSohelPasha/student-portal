# API Documentation - Student Portal Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Student APIs](#student-apis)
3. [Faculty APIs](#faculty-apis)
4. [Admin APIs](#admin-apis)

---

## Authentication APIs

### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "student|faculty|admin",
  "full_name": "string",
  "phone": "string" (optional),
  "department": "string" (optional),
  "year": number (for students),
  "semester": number (for students),
  "designation": "string" (for faculty)
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "full_name": "John Doe"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "full_name": "John Doe"
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

Get current authenticated user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "student",
    "full_name": "John Doe"
  }
}
```

---

### 4. Change Password
**POST** `/auth/change-password`

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Student APIs

### 1. Get Student Profile
**GET** `/student/profile`

Get current student's profile information.

**Response (200):**
```json
{
  "profile": {
    "id": 1,
    "user_id": 1,
    "student_id": "STU0001",
    "department": "Computer Science",
    "year": 2,
    "semester": 3,
    "user": {
      "id": 1,
      "username": "student1",
      "email": "student1@portal.com",
      "full_name": "Student 1"
    }
  }
}
```

---

### 2. Update Student Profile
**PUT** `/student/profile`

Update student profile.

**Request Body:**
```json
{
  "full_name": "string" (optional),
  "phone": "string" (optional),
  "department": "string" (optional),
  "year": number (optional),
  "semester": number (optional)
}
```

**Response (200):**
```json
{
  "message": "Profile updated",
  "profile": { ... }
}
```

---

### 3. Get Enrolled Courses
**GET** `/student/courses`

Get list of courses student is enrolled in.

**Response (200):**
```json
{
  "courses": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "enrollment_date": "2026-03-09T00:00:00",
      "grade": "A",
      "course": {
        "id": 1,
        "course_code": "CS101",
        "course_name": "Introduction to Programming",
        "credits": 4,
        "instructor": { ... }
      }
    }
  ]
}
```

---

### 4. Get Assignments
**GET** `/student/assignments`

Get all assignments for enrolled courses with submission status.

**Response (200):**
```json
{
  "assignments": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Assignment 1",
      "description": "Complete the programming task",
      "due_date": "2026-03-20T23:59:59",
      "max_marks": 100,
      "submission": {
        "id": 1,
        "marks": 85,
        "feedback": "Good work!",
        "submitted_at": "2026-03-15T10:30:00"
      }
    }
  ]
}
```

---

### 5. Submit Assignment
**POST** `/student/submit-assignment`

Submit an assignment.

**Request Body:**
```json
{
  "assignment_id": number,
  "file_path": "string"
}
```

**Response (201):**
```json
{
  "message": "Assignment submitted successfully",
  "submission": {
    "id": 1,
    "assignment_id": 1,
    "student_id": 1,
    "file_path": "/uploads/assignment.pdf",
    "submitted_at": "2026-03-09T14:30:00"
  }
}
```

---

### 6. Get Attendance
**GET** `/student/attendance`

Get attendance records and summary.

**Response (200):**
```json
{
  "attendance": [
    {
      "id": 1,
      "student_id": 1,
      "course_id": 1,
      "date": "2026-03-09",
      "status": "present"
    }
  ],
  "summary": [
    {
      "course": { ... },
      "total_classes": 10,
      "attended": 8,
      "percentage": 80.0
    }
  ]
}
```

---

### 7. Get Grades
**GET** `/student/grades`

Get grades for all courses.

**Response (200):**
```json
{
  "grades": [
    {
      "course": { ... },
      "final_grade": "A",
      "total_marks": 850,
      "max_marks": 1000,
      "percentage": 85.0,
      "submissions": [ ... ]
    }
  ]
}
```

---

### 8. Get Announcements
**GET** `/student/announcements`

Get announcements for students.

**Response (200):**
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "Exam Schedule",
      "content": "Mid-term exams will start from...",
      "author": { ... },
      "created_at": "2026-03-09T10:00:00"
    }
  ]
}
```

---

## Faculty APIs

### 1. Get Faculty Profile
**GET** `/faculty/profile`

Get faculty profile information.

**Response (200):**
```json
{
  "profile": {
    "id": 1,
    "user_id": 2,
    "faculty_id": "FAC0001",
    "department": "Computer Science",
    "designation": "Professor",
    "user": { ... }
  }
}
```

---

### 2. Get Faculty Courses
**GET** `/faculty/courses`

Get courses taught by faculty.

**Response (200):**
```json
{
  "courses": [
    {
      "id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "credits": 4,
      "semester": 1,
      "year": 2026
    }
  ]
}
```

---

### 3. Create Course
**POST** `/faculty/courses`

Create a new course.

**Request Body:**
```json
{
  "course_code": "string",
  "course_name": "string",
  "description": "string" (optional),
  "credits": number,
  "semester": number,
  "year": number
}
```

**Response (201):**
```json
{
  "message": "Course created successfully",
  "course": { ... }
}
```

---

### 4. Create Assignment
**POST** `/faculty/courses/:courseId/assignments`

Create assignment for a course.

**Request Body:**
```json
{
  "title": "string",
  "description": "string" (optional),
  "due_date": "ISO 8601 datetime string" (optional),
  "max_marks": number
}
```

**Response (201):**
```json
{
  "message": "Assignment created successfully",
  "assignment": { ... }
}
```

---

### 5. Get Assignment Submissions
**GET** `/faculty/assignments/:assignmentId/submissions`

Get all submissions for an assignment.

**Response (200):**
```json
{
  "submissions": [
    {
      "id": 1,
      "assignment_id": 1,
      "student_id": 1,
      "file_path": "/uploads/submission.pdf",
      "submitted_at": "2026-03-15T10:30:00",
      "marks": 85,
      "feedback": "Good work!"
    }
  ]
}
```

---

### 6. Grade Submission
**POST** `/faculty/submissions/:submissionId/grade`

Grade a student's submission.

**Request Body:**
```json
{
  "marks": number,
  "feedback": "string" (optional)
}
```

**Response (200):**
```json
{
  "message": "Submission graded successfully",
  "submission": { ... }
}
```

---

### 7. Upload Course Material
**POST** `/faculty/courses/:courseId/materials`

Upload study material for a course.

**Request Body:**
```json
{
  "title": "string",
  "description": "string" (optional),
  "file_path": "string"
}
```

**Response (201):**
```json
{
  "message": "Material uploaded successfully",
  "material": { ... }
}
```

---

### 8. Mark Attendance
**POST** `/faculty/courses/:courseId/attendance`

Mark attendance for students in a course.

**Request Body:**
```json
{
  "date": "YYYY-MM-DD" (optional, defaults to today),
  "attendance_records": [
    {
      "student_id": number,
      "status": "present|absent"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Attendance marked successfully"
}
```

---

### 9. Get Course Students
**GET** `/faculty/courses/:courseId/students`

Get list of students enrolled in a course.

**Response (200):**
```json
{
  "students": [
    {
      "id": 1,
      "student_id": "STU0001",
      "department": "Computer Science",
      "user": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "enrollment": {
        "id": 1,
        "enrollment_date": "2026-03-01",
        "grade": "A"
      }
    }
  ]
}
```

---

### 10. Create Announcement
**POST** `/faculty/announcements`

Create an announcement for students.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "target_role": "student|all" (optional, default: "student")
}
```

**Response (201):**
```json
{
  "message": "Announcement created successfully",
  "announcement": { ... }
}
```

---

## Admin APIs

### 1. Get All Students
**GET** `/admin/students`

Get list of all students.

**Response (200):**
```json
{
  "students": [ ... ]
}
```

---

### 2. Update Student
**PUT** `/admin/students/:studentId`

Update student information.

**Request Body:**
```json
{
  "full_name": "string" (optional),
  "email": "string" (optional),
  "phone": "string" (optional),
  "department": "string" (optional),
  "year": number (optional),
  "semester": number (optional)
}
```

**Response (200):**
```json
{
  "message": "Student updated successfully",
  "student": { ... }
}
```

---

### 3. Delete Student
**DELETE** `/admin/students/:studentId`

Delete a student account.

**Response (200):**
```json
{
  "message": "Student deleted successfully"
}
```

---

### 4. Get All Faculty
**GET** `/admin/faculty`

Get list of all faculty members.

**Response (200):**
```json
{
  "faculty": [ ... ]
}
```

---

### 5. Update Faculty
**PUT** `/admin/faculty/:facultyId`

Update faculty information.

---

### 6. Delete Faculty
**DELETE** `/admin/faculty/:facultyId`

Delete a faculty account.

---

### 7. Get All Courses
**GET** `/admin/courses`

Get list of all courses.

---

### 8. Delete Course
**DELETE** `/admin/courses/:courseId`

Delete a course.

---

### 9. Assign Faculty to Course
**POST** `/admin/courses/:courseId/assign-faculty`

Assign or change faculty for a course.

**Request Body:**
```json
{
  "faculty_id": number
}
```

---

### 10. Create Enrollment
**POST** `/admin/enrollments`

Enroll a student in a course.

**Request Body:**
```json
{
  "student_id": number,
  "course_id": number
}
```

**Response (201):**
```json
{
  "message": "Enrollment created successfully",
  "enrollment": { ... }
}
```

---

### 11. Delete Enrollment
**DELETE** `/admin/enrollments/:enrollmentId`

Remove a student from a course.

---

### 12. Get Analytics
**GET** `/admin/analytics`

Get system analytics and statistics.

**Response (200):**
```json
{
  "overview": {
    "total_students": number,
    "total_faculty": number,
    "total_courses": number,
    "total_assignments": number,
    "total_submissions": number,
    "graded_submissions": number
  },
  "department_distribution": [
    {
      "department": "Computer Science",
      "count": 50
    }
  ],
  "year_distribution": [ ... ],
  "course_enrollment": [ ... ]
}
```

---

### 13. Get Announcements
**GET** `/admin/announcements`

Get all announcements.

---

### 14. Create Announcement
**POST** `/admin/announcements`

Create a system-wide announcement.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "target_role": "all|student|faculty" (optional, default: "all")
}
```

---

### 15. Delete Announcement
**DELETE** `/admin/announcements/:announcementId`

Delete an announcement.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting to prevent abuse.

---

## Notes

- All datetime values are in ISO 8601 format
- All endpoints require proper authentication except `/auth/login` and `/auth/register`
- Role-based access is strictly enforced
- CORS is enabled for all origins (configure in production)

---

**API Version: 1.0**  
**Last Updated: March 9, 2026**
