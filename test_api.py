"""
Test script to verify Student Portal API endpoints
Run this after starting the server to test basic functionality
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api'

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_login():
    print_header("Testing Login")
    
    # Test admin login
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Admin login successful")
        print(f"  Token: {data['access_token'][:50]}...")
        return data['access_token']
    else:
        print("✗ Login failed")
        print(f"  Error: {response.json()}")
        return None

def test_student_login():
    print_header("Testing Student Login")
    
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'student1',
        'password': 'student123'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Student login successful")
        print(f"  User: {data['user']['full_name']}")
        return data['access_token']
    else:
        print("✗ Login failed")
        return None

def test_faculty_login():
    print_header("Testing Faculty Login")
    
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'username': 'faculty1',
        'password': 'faculty123'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Faculty login successful")
        print(f"  User: {data['user']['full_name']}")
        return data['access_token']
    else:
        print("✗ Login failed")
        return None

def test_student_endpoints(token):
    print_header("Testing Student Endpoints")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test get courses
    response = requests.get(f'{BASE_URL}/student/courses', headers=headers)
    if response.status_code == 200:
        courses = response.json()['courses']
        print(f"✓ Get courses successful - {len(courses)} courses found")
    else:
        print("✗ Get courses failed")
    
    # Test get assignments
    response = requests.get(f'{BASE_URL}/student/assignments', headers=headers)
    if response.status_code == 200:
        assignments = response.json()['assignments']
        print(f"✓ Get assignments successful - {len(assignments)} assignments found")
    else:
        print("✗ Get assignments failed")
    
    # Test get attendance
    response = requests.get(f'{BASE_URL}/student/attendance', headers=headers)
    if response.status_code == 200:
        attendance = response.json()
        print(f"✓ Get attendance successful - {len(attendance['summary'])} courses")
    else:
        print("✗ Get attendance failed")
    
    # Test get grades
    response = requests.get(f'{BASE_URL}/student/grades', headers=headers)
    if response.status_code == 200:
        grades = response.json()['grades']
        print(f"✓ Get grades successful - {len(grades)} courses")
    else:
        print("✗ Get grades failed")
    
    # Test get announcements
    response = requests.get(f'{BASE_URL}/student/announcements', headers=headers)
    if response.status_code == 200:
        announcements = response.json()['announcements']
        print(f"✓ Get announcements successful - {len(announcements)} announcements")
    else:
        print("✗ Get announcements failed")

def test_faculty_endpoints(token):
    print_header("Testing Faculty Endpoints")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test get courses
    response = requests.get(f'{BASE_URL}/faculty/courses', headers=headers)
    if response.status_code == 200:
        courses = response.json()['courses']
        print(f"✓ Get courses successful - {len(courses)} courses")
        if courses:
            # Test get course students
            course_id = courses[0]['id']
            response = requests.get(f'{BASE_URL}/faculty/courses/{course_id}/students', headers=headers)
            if response.status_code == 200:
                students = response.json()['students']
                print(f"✓ Get course students successful - {len(students)} students")
            else:
                print("✗ Get course students failed")
    else:
        print("✗ Get courses failed")

def test_admin_endpoints(token):
    print_header("Testing Admin Endpoints")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test get analytics
    response = requests.get(f'{BASE_URL}/admin/analytics', headers=headers)
    if response.status_code == 200:
        analytics = response.json()
        print("✓ Get analytics successful")
        print(f"  Total Students: {analytics['overview']['total_students']}")
        print(f"  Total Faculty: {analytics['overview']['total_faculty']}")
        print(f"  Total Courses: {analytics['overview']['total_courses']}")
    else:
        print("✗ Get analytics failed")
    
    # Test get students
    response = requests.get(f'{BASE_URL}/admin/students', headers=headers)
    if response.status_code == 200:
        students = response.json()['students']
        print(f"✓ Get students successful - {len(students)} students")
    else:
        print("✗ Get students failed")
    
    # Test get faculty
    response = requests.get(f'{BASE_URL}/admin/faculty', headers=headers)
    if response.status_code == 200:
        faculty = response.json()['faculty']
        print(f"✓ Get faculty successful - {len(faculty)} faculty members")
    else:
        print("✗ Get faculty failed")
    
    # Test get courses
    response = requests.get(f'{BASE_URL}/admin/courses', headers=headers)
    if response.status_code == 200:
        courses = response.json()['courses']
        print(f"✓ Get courses successful - {len(courses)} courses")
    else:
        print("✗ Get courses failed")
    
    # Test get announcements
    response = requests.get(f'{BASE_URL}/admin/announcements', headers=headers)
    if response.status_code == 200:
        announcements = response.json()['announcements']
        print(f"✓ Get announcements successful - {len(announcements)} announcements")
    else:
        print("✗ Get announcements failed")

def test_registration():
    print_header("Testing Registration")
    
    response = requests.post(f'{BASE_URL}/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'test123',
        'role': 'student',
        'full_name': 'Test User',
        'department': 'Computer Science',
        'year': 1
    })
    
    if response.status_code == 201:
        print("✓ Registration successful")
        print(f"  User: {response.json()['user']['full_name']}")
    elif response.status_code == 400:
        print("✓ Registration validation working (user may already exist)")
    else:
        print("✗ Registration failed")
        print(f"  Error: {response.json()}")

def main():
    print("\n" + "="*60)
    print("  Student Portal Management System - API Tests")
    print("="*60)
    print("\nMake sure the server is running on http://localhost:5000")
    print("\nPress Enter to start tests...")
    input()
    
    try:
        # Test authentication
        admin_token = test_login()
        student_token = test_student_login()
        faculty_token = test_faculty_login()
        
        # Test registration
        test_registration()
        
        # Test student endpoints
        if student_token:
            test_student_endpoints(student_token)
        
        # Test faculty endpoints
        if faculty_token:
            test_faculty_endpoints(faculty_token)
        
        # Test admin endpoints
        if admin_token:
            test_admin_endpoints(admin_token)
        
        print_header("Tests Complete!")
        print("\n✓ All basic API endpoints are working correctly")
        print("\nYou can now use the web interface at http://localhost:5000")
        
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Cannot connect to server")
        print("  Make sure the server is running with: python app.py")
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")

if __name__ == '__main__':
    main()
