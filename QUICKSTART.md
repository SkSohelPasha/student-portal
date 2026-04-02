# Quick Start Guide - Student Portal Management System

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Initialize Database
```bash
python init_db.py
```

### Step 3: Run Application
```bash
python app.py
```

### Step 4: Open Browser
Navigate to: **http://localhost:5000**

---

## 🔑 Quick Login

### Admin Dashboard
- Username: `admin`
- Password: `admin123`
- Access: Full system control, analytics, user management

### Faculty Dashboard  
- Username: `faculty1` (or faculty2, faculty3)
- Password: `faculty123`
- Access: Course management, grading, attendance

### Student Dashboard
- Username: `student1` (or student2 through student20)
- Password: `student123`
- Access: View courses, submit assignments, check grades

---

## 📚 Common Tasks

### As a Student:
1. Login with student credentials
2. Click "My Courses" to see enrolled courses
3. Click "Assignments" to view and submit assignments
4. Click "Attendance" to check attendance percentage
5. Click "Grades" to view your academic performance

### As Faculty:
1. Login with faculty credentials
2. Click "Create Course" to add a new course
3. Click "Manage" on any course to:
   - View enrolled students
   - Create assignments
   - Mark attendance
4. Grade student submissions

### As Admin:
1. Login with admin credentials
2. View system analytics on dashboard
3. Manage students, faculty, and courses
4. Create system-wide announcements
5. Assign faculty to courses
6. Enroll students in courses

---

## 📊 What's Included

✅ **1 Admin Account** - Full system access  
✅ **3 Faculty Accounts** - Different departments  
✅ **20 Student Accounts** - Various years/departments  
✅ **6 Sample Courses** - CS, Math, Physics  
✅ **18 Assignments** - Across all courses  
✅ **Attendance Records** - Last 10 days  
✅ **4 Announcements** - Sample notifications  

---

## 🎯 Main Features Demo

### Student Features
- ✅ View profile and enrolled courses
- ✅ Submit assignments online
- ✅ Check attendance (must be ≥75%)
- ✅ View grades and feedback
- ✅ Read announcements

### Faculty Features
- ✅ Create and manage courses
- ✅ Create assignments with deadlines
- ✅ Grade student submissions
- ✅ Mark daily attendance
- ✅ View student list

### Admin Features
- ✅ View system analytics with charts
- ✅ Manage all users
- ✅ Assign faculty to courses
- ✅ Create enrollments
- ✅ Post announcements

---

## 🔧 Troubleshooting

**Database Error?**
```bash
python init_db.py
```

**Port 5000 busy?**
Edit `app.py` line 53 and change port to 5001

**Can't login?**
Clear browser cache or use demo credentials above

---

## 📱 Test Scenarios

### Scenario 1: Student Submitting Assignment
1. Login as `student1` / `student123`
2. Go to "Assignments"
3. Click "Submit" on any pending assignment
4. Enter a file path or description
5. View submission confirmation

### Scenario 2: Faculty Grading
1. Login as `faculty1` / `faculty123`
2. Click "Manage" on a course
3. Go to "Create Assignment" tab
4. Fill in assignment details and create
5. Switch to Students tab to see enrolled students

### Scenario 3: Admin Analytics
1. Login as `admin` / `admin123`
2. View dashboard charts:
   - Department distribution
   - Course enrollments
   - Student/faculty/course counts

---

## 🌐 API Testing

### Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Student Courses (replace TOKEN)
```bash
curl -X GET http://localhost:5000/api/student/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💡 Tips

- **Student IDs** are auto-generated: STU0001, STU0002, etc.
- **Faculty IDs** are auto-generated: FAC0001, FAC0002, etc.
- **Default attendance** is 80% present (randomly generated)
- **Assignments** have random due dates 7-30 days ahead
- **Sample submissions** show different grade levels

---

## 📧 Need Help?

Check the full README.md for:
- Complete API documentation
- Database schema details
- Security features
- Advanced configuration

---

**Enjoy exploring the Student Portal! 🎓**
