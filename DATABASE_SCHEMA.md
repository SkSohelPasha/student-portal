# Database Schema Documentation

## Overview

The Student Portal Management System uses a relational database with the following tables:

1. Users (Main authentication table)
2. Students (Student-specific data)
3. Faculty (Faculty-specific data)
4. Courses (Course information)
5. Enrollments (Student-Course relationships)
6. Assignments (Course assignments)
7. Submissions (Student assignment submissions)
8. Attendance (Daily attendance records)
9. Materials (Course study materials)
10. Announcements (System announcements)

---

## Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
│─────────────│
│ id (PK)     │
│ username    │
│ email       │
│ password    │
│ role        │
│ full_name   │
│ phone       │
│ created_at  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐    ┌──────────┐
│ Students │    │ Faculty  │
│──────────│    │──────────│
│ id (PK)  │    │ id (PK)  │
│ user_id  │    │ user_id  │
│ dept     │    │ dept     │
│ year     │    │ design   │
└────┬─────┘    └────┬─────┘
     │               │
     │               │
     │         ┌─────▼──────┐
     │         │  Courses   │
     │         │────────────│
     │         │ id (PK)    │
     │         │ code       │
     │         │ name       │
     │         │ faculty_id │
     │         └─────┬──────┘
     │               │
     │               ├────────────┐
     │               │            │
     ▼               ▼            ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐
│ Enrollments │ │Materials │ │Assignment│
│─────────────│ │──────────│ │──────────│
│ id (PK)     │ │ id (PK)  │ │ id (PK)  │
│ student_id  │ │course_id │ │course_id │
│ course_id   │ └──────────┘ │ title    │
│ grade       │              │ due_date │
└──────┬──────┘              └────┬─────┘
       │                          │
       ▼                          ▼
┌─────────────┐         ┌──────────────┐
│ Attendance  │         │ Submissions  │
│─────────────│         │──────────────│
│ id (PK)     │         │ id (PK)      │
│ student_id  │         │assignment_id │
│ course_id   │         │ student_id   │
│ date        │         │ marks        │
│ status      │         │ feedback     │
└─────────────┘         └──────────────┘

┌──────────────┐
│Announcements │
│──────────────│
│ id (PK)      │
│ title        │
│ author_id    │
│ target_role  │
└──────────────┘
```

---

## Table Definitions

### 1. Users Table

**Purpose:** Store all user accounts (students, faculty, admin)

| Column        | Type         | Constraints                | Description                    |
|---------------|--------------|----------------------------|--------------------------------|
| id            | Integer      | PRIMARY KEY                | Unique user identifier         |
| username      | String(80)   | UNIQUE, NOT NULL           | Login username                 |
| email         | String(120)  | UNIQUE, NOT NULL           | User email address             |
| password_hash | String(255)  | NOT NULL                   | Hashed password (bcrypt)       |
| role          | String(20)   | NOT NULL                   | admin / faculty / student      |
| full_name     | String(120)  | NOT NULL                   | User's full name               |
| phone         | String(20)   | NULL                       | Contact phone number           |
| created_at    | DateTime     | DEFAULT current timestamp  | Account creation date          |

**Indexes:**
- Unique index on `username`
- Unique index on `email`

**Relationships:**
- One-to-One with Students (if role = 'student')
- One-to-One with Faculty (if role = 'faculty')
- One-to-Many with Announcements (as author)

---

### 2. Students Table

**Purpose:** Store student-specific information

| Column      | Type        | Constraints           | Description                |
|-------------|-------------|-----------------------|----------------------------|
| id          | Integer     | PRIMARY KEY           | Student record ID          |
| user_id     | Integer     | FOREIGN KEY, UNIQUE   | Reference to Users table   |
| student_id  | String(20)  | UNIQUE, NOT NULL      | Student ID (e.g., STU0001) |
| department  | String(100) | NULL                  | Department name            |
| year        | Integer     | NULL                  | Current year (1-4)         |
| semester    | Integer     | NULL                  | Current semester (1-8)     |

**Indexes:**
- Unique index on `student_id`
- Foreign key index on `user_id`

**Relationships:**
- One-to-One with Users
- One-to-Many with Enrollments
- One-to-Many with Submissions
- One-to-Many with Attendance

**Cascade Rules:**
- DELETE CASCADE from Users

---

### 3. Faculty Table

**Purpose:** Store faculty-specific information

| Column      | Type        | Constraints           | Description                  |
|-------------|-------------|-----------------------|------------------------------|
| id          | Integer     | PRIMARY KEY           | Faculty record ID            |
| user_id     | Integer     | FOREIGN KEY, UNIQUE   | Reference to Users table     |
| faculty_id  | String(20)  | UNIQUE, NOT NULL      | Faculty ID (e.g., FAC0001)   |
| department  | String(100) | NULL                  | Department name              |
| designation | String(100) | NULL                  | Professor/Associate/Assistant|

**Indexes:**
- Unique index on `faculty_id`
- Foreign key index on `user_id`

**Relationships:**
- One-to-One with Users
- One-to-Many with Courses

**Cascade Rules:**
- DELETE CASCADE from Users

---

### 4. Courses Table

**Purpose:** Store course information

| Column       | Type        | Constraints      | Description                    |
|--------------|-------------|------------------|--------------------------------|
| id           | Integer     | PRIMARY KEY      | Course ID                      |
| course_code  | String(20)  | UNIQUE, NOT NULL | Course code (e.g., CS101)      |
| course_name  | String(200) | NOT NULL         | Course name                    |
| description  | Text        | NULL             | Course description             |
| credits      | Integer     | NULL             | Credit hours                   |
| faculty_id   | Integer     | FOREIGN KEY      | Instructor faculty ID          |
| semester     | Integer     | NULL             | Semester number                |
| year         | Integer     | NULL             | Academic year                  |
| created_at   | DateTime    | DEFAULT now      | Course creation date           |

**Indexes:**
- Unique index on `course_code`
- Foreign key index on `faculty_id`

**Relationships:**
- Many-to-One with Faculty (instructor)
- One-to-Many with Enrollments
- One-to-Many with Assignments
- One-to-Many with Materials
- One-to-Many with Attendance

---

### 5. Enrollments Table

**Purpose:** Link students to courses (many-to-many relationship)

| Column          | Type     | Constraints                    | Description              |
|-----------------|----------|--------------------------------|--------------------------|
| id              | Integer  | PRIMARY KEY                    | Enrollment ID            |
| student_id      | Integer  | FOREIGN KEY, NOT NULL          | Reference to Students    |
| course_id       | Integer  | FOREIGN KEY, NOT NULL          | Reference to Courses     |
| enrollment_date | DateTime | DEFAULT now                    | Date of enrollment       |
| grade           | String(5)| NULL                           | Final grade (A, B, C...) |

**Indexes:**
- Composite unique index on `(student_id, course_id)`
- Foreign key index on `student_id`
- Foreign key index on `course_id`

**Relationships:**
- Many-to-One with Students
- Many-to-One with Courses

**Cascade Rules:**
- DELETE CASCADE from Students and Courses

---

### 6. Assignments Table

**Purpose:** Store course assignments

| Column      | Type        | Constraints          | Description                |
|-------------|-------------|----------------------|----------------------------|
| id          | Integer     | PRIMARY KEY          | Assignment ID              |
| course_id   | Integer     | FOREIGN KEY, NOT NULL| Reference to Courses       |
| title       | String(200) | NOT NULL             | Assignment title           |
| description | Text        | NULL                 | Assignment description     |
| due_date    | DateTime    | NULL                 | Submission deadline        |
| max_marks   | Integer     | DEFAULT 100          | Maximum marks              |
| created_at  | DateTime    | DEFAULT now          | Assignment creation date   |

**Indexes:**
- Foreign key index on `course_id`

**Relationships:**
- Many-to-One with Courses
- One-to-Many with Submissions

**Cascade Rules:**
- DELETE CASCADE from Courses

---

### 7. Submissions Table

**Purpose:** Store student assignment submissions

| Column        | Type        | Constraints                    | Description                |
|---------------|-------------|--------------------------------|----------------------------|
| id            | Integer     | PRIMARY KEY                    | Submission ID              |
| assignment_id | Integer     | FOREIGN KEY, NOT NULL          | Reference to Assignments   |
| student_id    | Integer     | FOREIGN KEY, NOT NULL          | Reference to Students      |
| file_path     | String(500) | NULL                           | Path to submitted file     |
| submitted_at  | DateTime    | DEFAULT now                    | Submission timestamp       |
| marks         | Integer     | NULL                           | Marks awarded              |
| feedback      | Text        | NULL                           | Faculty feedback           |

**Indexes:**
- Composite unique index on `(assignment_id, student_id)`
- Foreign key index on `assignment_id`
- Foreign key index on `student_id`

**Relationships:**
- Many-to-One with Assignments
- Many-to-One with Students

**Cascade Rules:**
- DELETE CASCADE from Assignments and Students

**Business Rules:**
- One submission per student per assignment
- Marks cannot exceed assignment.max_marks

---

### 8. Attendance Table

**Purpose:** Track daily student attendance

| Column     | Type    | Constraints                    | Description              |
|------------|---------|--------------------------------|--------------------------|
| id         | Integer | PRIMARY KEY                    | Attendance record ID     |
| student_id | Integer | FOREIGN KEY, NOT NULL          | Reference to Students    |
| course_id  | Integer | FOREIGN KEY, NOT NULL          | Reference to Courses     |
| date       | Date    | NOT NULL                       | Attendance date          |
| status     | String(10)| NOT NULL                     | present / absent         |

**Indexes:**
- Composite unique index on `(student_id, course_id, date)`
- Foreign key index on `student_id`
- Foreign key index on `course_id`

**Relationships:**
- Many-to-One with Students
- Many-to-One with Courses

**Cascade Rules:**
- DELETE CASCADE from Students and Courses

**Business Rules:**
- One attendance record per student per course per day
- Status must be 'present' or 'absent'

---

### 9. Materials Table

**Purpose:** Store course study materials

| Column      | Type        | Constraints          | Description                |
|-------------|-------------|----------------------|----------------------------|
| id          | Integer     | PRIMARY KEY          | Material ID                |
| course_id   | Integer     | FOREIGN KEY, NOT NULL| Reference to Courses       |
| title       | String(200) | NOT NULL             | Material title             |
| description | Text        | NULL                 | Material description       |
| file_path   | String(500) | NULL                 | Path to material file      |
| uploaded_at | DateTime    | DEFAULT now          | Upload timestamp           |

**Indexes:**
- Foreign key index on `course_id`

**Relationships:**
- Many-to-One with Courses

**Cascade Rules:**
- DELETE CASCADE from Courses

---

### 10. Announcements Table

**Purpose:** Store system and course announcements

| Column      | Type        | Constraints          | Description                   |
|-------------|-------------|----------------------|-------------------------------|
| id          | Integer     | PRIMARY KEY          | Announcement ID               |
| title       | String(200) | NOT NULL             | Announcement title            |
| content     | Text        | NOT NULL             | Announcement content          |
| author_id   | Integer     | FOREIGN KEY, NOT NULL| Reference to Users            |
| target_role | String(20)  | NULL                 | all / student / faculty       |
| created_at  | DateTime    | DEFAULT now          | Creation timestamp            |

**Indexes:**
- Foreign key index on `author_id`
- Index on `target_role` for filtering

**Relationships:**
- Many-to-One with Users (author)

---

## Data Integrity Rules

### Constraints

1. **User uniqueness**: Username and email must be unique across all users
2. **One submission per assignment**: A student can submit each assignment only once
3. **One attendance per day**: Cannot mark attendance twice for same student/course/date
4. **Role validation**: User role must be one of: 'admin', 'faculty', 'student'
5. **Status validation**: Attendance status must be 'present' or 'absent'

### Cascade Behaviors

- Deleting a User → Deletes associated Student/Faculty profile
- Deleting a Student → Deletes Enrollments, Submissions, Attendance
- Deleting a Course → Deletes Enrollments, Assignments, Materials, Attendance
- Deleting an Assignment → Deletes Submissions

### Default Values

- `created_at` fields default to current timestamp
- `uploaded_at` fields default to current timestamp
- `submitted_at` fields default to current timestamp
- `max_marks` in assignments defaults to 100

---

## Sample Queries

### Get student's attendance percentage
```sql
SELECT 
    c.course_name,
    COUNT(*) as total_classes,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as attended,
    (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as percentage
FROM attendance a
JOIN courses c ON a.course_id = c.id
WHERE a.student_id = :student_id
GROUP BY c.id, c.course_name;
```

### Get student's grade summary
```sql
SELECT 
    c.course_name,
    SUM(s.marks) as total_marks,
    SUM(a.max_marks) as max_marks,
    (SUM(s.marks) * 100.0 / SUM(a.max_marks)) as percentage
FROM submissions s
JOIN assignments a ON s.assignment_id = a.id
JOIN courses c ON a.course_id = c.id
WHERE s.student_id = :student_id
GROUP BY c.id, c.course_name;
```

### Get courses with enrollment count
```sql
SELECT 
    c.course_code,
    c.course_name,
    COUNT(e.id) as enrollment_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.course_code, c.course_name
ORDER BY enrollment_count DESC;
```

---

## Migration Notes

### From SQLite to PostgreSQL

1. Change in config.py:
```python
SQLALCHEMY_DATABASE_URI = 'postgresql://user:pass@localhost/student_portal'
```

2. Install PostgreSQL adapter:
```bash
pip install psycopg2-binary
```

3. Run migrations:
```bash
python init_db.py
```

### From SQLite to MySQL

1. Change in config.py:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:pass@localhost/student_portal'
```

2. Install MySQL adapter:
```bash
pip install pymysql
```

---

## Performance Optimization

### Recommended Indexes

Already implemented:
- Primary keys on all tables
- Foreign key indexes
- Unique constraints on usernames, emails, IDs

Additional indexes for production:
```sql
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX idx_submissions_marks ON submissions(marks);
```

### Query Optimization Tips

1. Use joins instead of multiple queries
2. Add pagination for large result sets
3. Use database-level aggregation for statistics
4. Cache frequently accessed data (courses list, announcements)

---

**Schema Version: 1.0**  
**Last Updated: March 9, 2026**
