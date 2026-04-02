// Main Application Logic

// Toast Notification
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toastNotification');
    const toastBody = document.getElementById('toastBody');
    
    toastBody.textContent = message;
    
    // Change toast color based on type
    toastEl.className = 'toast';
    toastEl.classList.add(`bg-${type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'info'}`);
    toastEl.classList.add('text-white');
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Initialize Application
function initApp() {
    // Check if user is authenticated
    if (isAuthenticated()) {
        showDashboard();
    } else {
        document.getElementById('loginPage').style.display = 'block';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initApp);

// Faculty Helper Functions
function showCreateCourseModal() {
    const modalHTML = `
        <div class="modal fade" id="createCourseModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New Course</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="createCourseForm" onsubmit="handleCreateCourse(event)">
                            <div class="mb-3">
                                <label class="form-label">Course Code</label>
                                <input type="text" class="form-control" name="course_code" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Course Name</label>
                                <input type="text" class="form-control" name="course_name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Credits</label>
                                <input type="number" class="form-control" name="credits" min="1" max="6" value="3">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Semester</label>
                                <input type="number" class="form-control" name="semester" min="1" max="8" value="1">
                            </div>
                            <button type="submit" class="btn btn-primary">Create Course</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('createCourseModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('createCourseModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleCreateCourse(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const courseData = {
        course_code: formData.get('course_code'),
        course_name: formData.get('course_name'),
        description: formData.get('description'),
        credits: parseInt(formData.get('credits')),
        semester: parseInt(formData.get('semester')),
        year: new Date().getFullYear()
    };
    
    try {
        await facultyAPI.createCourse(courseData);
        showToast('Course created successfully!', 'success');
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('createCourseModal')).hide();
        
        // Reload faculty dashboard
        loadFacultyDashboard();
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function manageCourse(courseId) {
    // Simple course management - show students and create assignment
    const students = await facultyAPI.getCourseStudents(courseId);
    
    const modalHTML = `
        <div class="modal fade" id="manageCourseModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Manage Course</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3">
                            <li class="nav-item">
                                <a class="nav-link active" data-bs-toggle="tab" href="#studentsTab">Students</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#assignmentTab">Create Assignment</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#attendanceTab">Mark Attendance</a>
                            </li>
                        </ul>
                        
                        <div class="tab-content">
                            <div id="studentsTab" class="tab-pane fade show active">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Name</th>
                                            <th>Department</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${students.students.map(s => `
                                            <tr>
                                                <td>${s.student_id}</td>
                                                <td>${s.user.full_name}</td>
                                                <td>${s.department}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div id="assignmentTab" class="tab-pane fade">
                                <form id="createAssignmentForm" onsubmit="handleCreateAssignment(event, ${courseId})">
                                    <div class="mb-3">
                                        <label class="form-label">Title</label>
                                        <input type="text" class="form-control" name="title" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" name="description" rows="3"></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Due Date</label>
                                        <input type="datetime-local" class="form-control" name="due_date">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Max Marks</label>
                                        <input type="number" class="form-control" name="max_marks" value="100">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Create Assignment</button>
                                </form>
                            </div>
                            
                            <div id="attendanceTab" class="tab-pane fade">
                                <form id="attendanceForm" onsubmit="handleMarkAttendance(event, ${courseId})">
                                    <div class="mb-3">
                                        <label class="form-label">Date</label>
                                        <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}">
                                    </div>
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Present</th>
                                                <th>Absent</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${students.students.map(s => `
                                                <tr>
                                                    <td>${s.user.full_name}</td>
                                                    <td>
                                                        <input type="radio" name="student_${s.id}" value="present" checked>
                                                    </td>
                                                    <td>
                                                        <input type="radio" name="student_${s.id}" value="absent">
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <button type="submit" class="btn btn-primary">Mark Attendance</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('manageCourseModal'));
    modal.show();
    
    document.getElementById('manageCourseModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

async function handleCreateAssignment(event, courseId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const assignmentData = {
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('due_date') || null,
        max_marks: parseInt(formData.get('max_marks'))
    };
    
    try {
        await facultyAPI.createAssignment(courseId, assignmentData);
        showToast('Assignment created successfully!', 'success');
        form.reset();
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function handleMarkAttendance(event, courseId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const attendance_records = [];
    
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('student_')) {
            const studentId = parseInt(key.replace('student_', ''));
            attendance_records.push({
                student_id: studentId,
                status: value
            });
        }
    }
    
    const attendanceData = {
        date: formData.get('date'),
        attendance_records: attendance_records
    };
    
    try {
        await facultyAPI.markAttendance(courseId, attendanceData);
        showToast('Attendance marked successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

// Prevent form submission on Enter key (except in textareas)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const form = e.target.closest('form');
        if (form && e.target.type !== 'submit') {
            e.preventDefault();
        }
    }
});
