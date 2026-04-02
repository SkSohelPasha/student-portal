// Dashboard Functions

async function showDashboard() {
    const user = getCurrentUser();
    
    if (!user) {
        logout();
        return;
    }
    
    // Hide login, show dashboard wrapper
    document.getElementById('loginPage').style.display = 'none';
    const wrapper = document.getElementById('dashboardWrapper');
    wrapper.style.display = 'flex';
    
    // Update sidebar user info
    const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    document.getElementById('headerAvatar').textContent = initials;
    document.getElementById('sidebarUserName').textContent = user.full_name;
    document.getElementById('headerUserName').textContent = user.full_name;
    document.getElementById('sidebarUserRole').textContent = user.role;
    
    // Role-specific sidebar items
    const facultyItem = document.getElementById('adminOnlyFaculty');
    const studentsItem = document.getElementById('navItemStudents');
    
    if (user.role !== 'admin') {
        facultyItem.style.display = 'none';
    } else {
        facultyItem.style.display = 'block';
    }
    
    if (user.role !== 'admin') {
        if (studentsItem) studentsItem.style.display = 'none';
    } else {
        if (studentsItem) studentsItem.style.display = 'block';
    }

    // Load initial section
    await loadDashboardSection('dashboard');
    
    // Fetch notifications to populate the bell icon badge
    fetchAndShowNotifications();

    // Check for new notifications every minute
    if (window.notificationInterval) clearInterval(window.notificationInterval);
    window.notificationInterval = setInterval(fetchAndShowNotifications, 60000);
}

async function loadDashboardSection(section) {
    const user = getCurrentUser();
    
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(`'${section}'`)) {
            item.classList.add('active');
        }
    });

    switch (section) {
        case 'dashboard':
            if (user.role === 'admin') await loadAdminDashboard();
            else if (user.role === 'faculty') await loadFacultyDashboard(true);
            else await loadStudentDashboard(true);
            break;
        case 'students':
            if (user.role === 'admin') await showAdminStudents();
            else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('students');
            }
            break;
        case 'faculty':
            if (user.role === 'admin') await showAdminFaculty();
            break;
        case 'courses':
            if (user.role === 'admin') await showAdminCourses();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('courses');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('courses');
            }
            break;
        case 'assignments':
            if (user.role === 'admin') await showAdminAssignments();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('assignments');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('assignments');
            }
            break;
        case 'attendance':
            if (user.role === 'admin') await showAdminAttendance();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('attendance');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('attendance');
            }
            break;
        case 'results':
            if (user.role === 'admin') await showAdminResults();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('grades');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('results');
            }
            break;
        case 'notices':
            if (user.role === 'admin') await showAdminNotices();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('announcements');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('notices');
            }
            break;
        case 'profile':
            if (user.role === 'admin') await showAdminProfile();
            else if (user.role === 'student') {
                await loadStudentDashboard(false);
                await showStudentSection('profile');
            } else if (user.role === 'faculty') {
                await loadFacultyDashboard(false);
                await showFacultySection('profile');
            }
            break;
        default:
            document.getElementById('dashboardContent').innerHTML = `
                <div class="welcome-text mb-4">
                    <h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
                    <p>This section is under construction.</p>
                </div>
            `;
    }
}

// Student Dashboard
async function loadStudentDashboard(loadOverview = true) {
    const container = document.getElementById('dashboardContent');
    
    if (!document.getElementById('studentContent')) {
        const user = getCurrentUser();
        container.innerHTML = `
            <div class="welcome-text mb-4">
                <h2>Welcome back, ${user.full_name} 👋</h2>
                <p>Ready to check your progress today?</p>
            </div>
            <div id="studentContent"></div>
        `;
    }
    
    if (loadOverview) {
        showStudentSection('overview');
    }
}

// Add Sidebar Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    // Desktop Toggle
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
            } else {
                icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
            }
        });
    }

    // Mobile Toggle
    if (mobileToggle && sidebar && overlay) {
        const toggleMobile = () => {
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        };

        mobileToggle.addEventListener('click', toggleMobile);
        overlay.addEventListener('click', toggleMobile);

        // Auto-close on mobile when link is clicked
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('mobile-active');
                    overlay.classList.remove('active');
                }
            });
        });
    }
});

async function showStudentSection(section) {
    // Update active link
    document.querySelectorAll('.dashboard-sidebar .nav-item').forEach(link => {
        link.classList.remove('active');
        // Check if this link corresponds to the current section
        if (link.getAttribute('onclick')?.includes(`'${section}'`)) {
            link.classList.add('active');
        }
    });
    
    const content = document.getElementById('studentContent');
    
    try {
        switch (section) {
            case 'overview':
                await showStudentOverview(content);
                break;
            case 'courses':
                await showStudentCourses(content);
                break;
            case 'assignments':
                await showStudentAssignments(content);
                break;
            case 'attendance':
                await showStudentAttendance(content);
                break;
            case 'grades':
                await showStudentGrades(content);
                break;
            case 'announcements':
                await showStudentAnnouncements(content);
                break;
            case 'profile':
                await showStudentProfile(content);
                break;
        }
    } catch (error) {
        content.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

async function showStudentOverview(content) {
    const [courses, assignments, attendance] = await Promise.all([
        studentAPI.getCourses(),
        studentAPI.getAssignments(),
        studentAPI.getAttendance()
    ]);
    
    const pendingAssignments = assignments.assignments.filter(a => !a.submission);
    
    content.innerHTML = `
        <div class="summary-cards-grid">
            <div class="edu-card card-teal" onclick="showStudentSection('attendance')">
                <div class="card-label">Attendance Rate</div>
                <div class="card-value">${attendance.summary[0]?.percentage.toFixed(1) || 0}%</div>
                <div class="card-subtext">Across all courses</div>
                <div class="card-icon-bg"><i class="fas fa-calendar-check"></i></div>
            </div>
            
            <div class="edu-card card-orange" onclick="showStudentSection('assignments')">
                <div class="card-label">Pending Tasks</div>
                <div class="card-value">${pendingAssignments.length}</div>
                <div class="card-subtext">Due this week</div>
                <div class="card-icon-bg"><i class="fas fa-file-signature"></i></div>
            </div>
            
            <div class="edu-card card-green" onclick="showStudentSection('grades')">
                <div class="card-label">Sem Average</div>
                <div class="card-value">3.85</div>
                <div class="card-subtext">+0.2 from last term</div>
                <div class="card-icon-bg"><i class="fas fa-chart-line"></i></div>
            </div>
            
            <div class="edu-card card-white" onclick="showStudentSection('courses')">
                <div class="card-label">My Courses</div>
                <div class="card-value">${courses.courses.length}</div>
                <div class="card-subtext">Enrollment active</div>
                <div class="card-icon-bg"><i class="fas fa-book-reader"></i></div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="content-card">
                <div class="card-title">Recent Assignments</div>
                <div class="notice-list">
                    ${assignments.assignments.slice(0, 4).map(a => `
                        <div class="notice-item">
                            <div class="notice-item-title">${a.title}</div>
                            <div class="notice-meta">
                                <span class="category-badge">${a.course.course_name}</span>
                                <span class="notice-date">
                                    ${a.submission ? 
                                        '<span class="text-success fw-bold">Submitted</span>' : 
                                        `<span class="text-warning fw-bold">Due ${new Date(a.due_date).toLocaleDateString()}</span>`}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="content-card">
                <div class="card-title">Quick Profile</div>
                <div class="text-center py-3">
                    <div class="profile-avatar mx-auto mb-3" style="width: 80px; height: 80px; font-size: 2rem;">
                        ${getCurrentUser().full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <h5 class="fw-bold mb-1">${getCurrentUser().full_name}</h5>
                    <p class="text-muted small mb-3">ID: ST-2026-001</p>
                    <div class="d-grid">
                        <button class="btn btn-outline-primary btn-sm rounded-pill" onclick="showStudentSection('profile')">View Full Profile</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function showStudentCourses(content) {
    const data = await studentAPI.getCourses();
    
    if (!data.courses || data.courses.length === 0) {
        content.innerHTML = `
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body text-center p-5">
                    <i class="fas fa-book-open fa-4x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">No Courses Available</h4>
                    <p class="text-muted">Not Provided by the faculty</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-book-reader text-primary me-2"></i> My Courses</h4>
        </div>
        <div class="row g-4">
            ${data.courses.map(enrollment => `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm bg-white rounded-4 overflow-hidden" style="transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                        <div class="bg-primary p-3 text-white">
                            <h5 class="fw-bold mb-1 text-truncate">${enrollment.course.course_name}</h5>
                            <p class="mb-0 small text-white-50">${enrollment.course.course_code}</p>
                        </div>
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-light rounded-circle p-2 me-3">
                                    <i class="fas fa-chalkboard-teacher text-primary"></i>
                                </div>
                                <div>
                                    <small class="text-muted d-block">Instructor</small>
                                    <span class="fw-medium">${enrollment.course.instructor?.user?.full_name || 'Not Assigned'}</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center border-top pt-3">
                                <div>
                                    <small class="text-muted d-block">Credits</small>
                                    <span class="fw-bold fs-5">${enrollment.course.credits}</span>
                                </div>
                                ${enrollment.grade ? 
                                    `<div class="text-end">
                                        <small class="text-muted d-block">Grade</small>
                                        <span class="badge bg-success rounded-pill px-3 py-2 fs-6">${enrollment.grade}</span>
                                    </div>` : 
                                    `<div class="text-end">
                                        <small class="text-muted d-block">Status</small>
                                        <span class="badge bg-secondary rounded-pill px-3 py-2">Enrolled</span>
                                    </div>`}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function showStudentAssignments(content) {
    const data = await studentAPI.getAssignments();
    
    if (!data.assignments || data.assignments.length === 0) {
        content.innerHTML = `
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body text-center p-5">
                    <i class="fas fa-file-signature fa-4x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">No Assignments</h4>
                    <p class="text-muted">Not Provided by the faculty</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-tasks text-warning me-2"></i> Assignments</h4>
        </div>
        <div class="row g-4">
            ${data.assignments.map(assignment => `
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden ${assignment.submission ? 'border-start border-success border-5' : 'border-start border-warning border-5'}" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div class="card-body p-4">
                            <div class="row align-items-center">
                                <div class="col-md-8 mb-3 mb-md-0">
                                    <span class="badge bg-light text-dark mb-2 border">${assignment.course.course_name}</span>
                                    <h5 class="fw-bold mb-2">${assignment.title}</h5>
                                    <p class="text-muted mb-3 small w-75">${assignment.description || 'No description provided.'}</p>
                                    <div class="d-flex text-muted small">
                                        <div class="me-4"><i class="far fa-calendar-alt me-1 text-primary"></i> Due: <span class="fw-medium text-dark">${new Date(assignment.due_date).toLocaleDateString()}</span></div>
                                        <div><i class="fas fa-star me-1 text-warning"></i> Max Points: <span class="fw-medium text-dark">${assignment.max_marks}</span></div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-md-end text-start">
                                    ${assignment.submission ? 
                                        `<div class="mb-2">
                                            <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill border border-success">
                                                <i class="fas fa-check-circle me-1"></i> Submitted
                                            </span>
                                        </div>
                                         ${assignment.submission.marks !== null ? 
                                            `<div class="fs-3 fw-bold text-primary mt-2">${assignment.submission.marks}<span class="fs-6 text-muted fw-normal">/${assignment.max_marks}</span></div>` : 
                                            `<div class="text-warning small fw-medium mt-2"><i class="fas fa-hourglass-half me-1"></i> Pending Evaluation</div>`}
                                         ${assignment.submission.feedback ? `<div class="mt-3 text-start bg-light p-3 rounded-3 small border-start border-info border-3"><strong>Feedback:</strong> ${assignment.submission.feedback}</div>` : ''}` :
                                        `<button class="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold" onclick="submitAssignment(${assignment.id})">
                                            <i class="fas fa-cloud-upload-alt me-2"></i> Submit Work
                                        </button>`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function submitAssignment(assignmentId) {
    const filePath = prompt('Enter file path or description of submission:');
    if (filePath) {
        try {
            await studentAPI.submitAssignment({ assignment_id: assignmentId, file_path: filePath });
            showToast('Assignment submitted successfully!', 'success');
            showStudentSection('assignments');
        } catch (error) {
            showToast(error.message, 'danger');
        }
    }
}

async function showStudentAttendance(content) {
    const data = await studentAPI.getAttendance();
    
    if (!data.summary || data.summary.length === 0) {
        content.innerHTML = `
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body text-center p-5">
                    <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">No Attendance Records</h4>
                    <p class="text-muted">Not Provided by the faculty</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-user-check text-info me-2"></i> Attendance Record</h4>
        </div>
        <div class="row g-4">
            ${data.summary.map(summary => `
                <div class="col-md-6 col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 h-100">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="w-75">
                                    <h6 class="fw-bold m-0 text-truncate" title="${summary.course.course_name}">${summary.course.course_name}</h6>
                                    <small class="text-muted d-block mt-1">Course Content</small>
                                </div>
                                <div class="bg-light rounded p-2 text-center" style="min-width: 60px;">
                                    <span class="d-block fw-bold text-dark fs-5">${summary.attended}</span>
                                    <span class="d-block text-muted" style="font-size: 0.70rem;">/ ${summary.total_classes}</span>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="small fw-medium text-muted">Attendance Rate</span>
                                    <span class="small fw-bold ${summary.percentage >= 75 ? 'text-success' : 'text-danger'}">${summary.percentage.toFixed(1)}%</span>
                                </div>
                                <div class="progress rounded-pill bg-light" style="height: 10px;">
                                    <div class="progress-bar ${summary.percentage >= 75 ? 'bg-success' : 'bg-danger'} progress-bar-striped progress-bar-animated" 
                                         role="progressbar" 
                                         style="width: ${summary.percentage}%" 
                                         aria-valuenow="${summary.percentage}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                        ${summary.percentage < 75 ? `<div class="card-footer bg-danger bg-opacity-10 text-danger border-0 py-2 px-4 small fw-medium"><i class="fas fa-exclamation-triangle me-1"></i> Below required minimum (75%)</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function showStudentGrades(content) {
    const data = await studentAPI.getGrades();
    
    if (!data.grades || data.grades.length === 0) {
        content.innerHTML = `
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body text-center p-5">
                    <i class="fas fa-award fa-4x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">No Results Published</h4>
                    <p class="text-muted">Not Provided by the faculty</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-chart-pie text-success me-2"></i> Academic Results</h4>
        </div>
        <div class="row g-4">
            ${data.grades.map(grade => `
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold m-0 text-dark">${grade.course.course_name}</h5>
                            ${grade.final_grade ? 
                                `<span class="badge bg-primary text-white fs-6 px-4 py-2 rounded-pill shadow-sm">Grade: ${grade.final_grade}</span>` : 
                                `<span class="badge bg-light text-muted border px-4 py-2 rounded-pill">Pending Result</span>`}
                        </div>
                        <div class="card-body p-0">
                            <div class="row g-0">
                                <div class="col-lg-8 border-end-lg">
                                    <div class="table-responsive p-3">
                                        <table class="table table-borderless table-hover mb-0 align-middle">
                                            <thead class="text-muted small align-middle" style="background-color: #f8f9fa;">
                                                <tr>
                                                    <th class="rounded-start px-4">Assignment</th>
                                                    <th class="text-center">Score</th>
                                                    <th class="text-end rounded-end px-4">Weight</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${grade.submissions.length === 0 ? `<tr><td colspan="3" class="text-center py-5 text-muted small">No submitted assignments evaluated for this course yet</td></tr>` : 
                                                grade.submissions.map(sub => `
                                                    <tr>
                                                        <td class="fw-medium px-4 py-3">${sub.assignment.title}</td>
                                                        <td class="text-center py-3">
                                                            ${sub.marks !== null ? 
                                                                `<span class="fw-bold text-dark bg-light px-2 py-1 rounded">${sub.marks}</span> <span class="text-muted small">/ ${sub.assignment.max_marks}</span>` : 
                                                                `<span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">Pending</span>`}
                                                        </td>
                                                        <td class="text-end px-4 py-3"><div class="progress rounded-pill bg-light w-75 ms-auto" style="height:6px;"><div class="progress-bar bg-info" style="width: 100%"></div></div></td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="col-lg-4 bg-light d-flex flex-column justify-content-center align-items-center p-5">
                                    <div class="text-muted mb-2 text-uppercase small fw-bold tracking-wide" style="letter-spacing: 1px;">Overall Score</div>
                                    <div class="display-4 fw-bold text-dark mb-1">${grade.percentage.toFixed(1)}<span class="fs-4 text-muted fw-normal">%</span></div>
                                    <div class="text-success small fw-medium mt-2 bg-success bg-opacity-10 px-3 py-1 rounded-pill"><i class="fas fa-check me-1"></i> Passing</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function showStudentAnnouncements(content) {
    const data = await studentAPI.getAnnouncements();
    
    if (!data.announcements || data.announcements.length === 0) {
        content.innerHTML = `
            <div class="card border-0 shadow-sm mt-4">
                <div class="card-body text-center p-5">
                    <i class="fas fa-bullhorn fa-4x text-muted mb-3"></i>
                    <h4 class="text-secondary fw-bold">No Notices Available</h4>
                    <p class="text-muted">Not Provided by the faculty</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-bullhorn text-danger me-2"></i> Notices & Announcements</h4>
        </div>
        <div class="row g-4">
            ${data.announcements.map(announcement => `
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-danger border-5" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div class="card-body p-4">
                            <div class="row align-items-center">
                                <div class="col-md-9 mb-3 mb-md-0">
                                    <h5 class="fw-bold mb-2">${announcement.title}</h5>
                                    <p class="text-muted mb-3 w-100">${announcement.content}</p>
                                    <div class="d-flex text-muted small">
                                        <div class="me-4"><i class="fas fa-user me-1 text-primary"></i> <span class="fw-medium text-dark">${announcement.author.full_name}</span></div>
                                        <div><i class="fas fa-clock me-1 text-warning"></i> <span class="fw-medium text-dark">${new Date(announcement.created_at).toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div class="col-md-3 text-md-end text-start">
                                    <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill border border-danger">
                                        <i class="fas fa-info-circle me-1"></i> Notice
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function showStudentProfile(content) {
    const data = await studentAPI.getProfile();
    const user = getCurrentUser();
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <i class="fas fa-user"></i> Profile
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <table class="table">
                            <tr>
                                <th>Student ID:</th>
                                <td>${data.profile.student_id}</td>
                            </tr>
                            <tr>
                                <th>Full Name:</th>
                                <td>${data.profile.user.full_name}</td>
                            </tr>
                            <tr>
                                <th>Email:</th>
                                <td>${data.profile.user.email}</td>
                            </tr>
                            <tr>
                                <th>Phone:</th>
                                <td>${data.profile.user.phone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Department:</th>
                                <td>${data.profile.department || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Year:</th>
                                <td>${data.profile.year || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th>Semester:</th>
                                <td>${data.profile.semester || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Faculty Dashboard (Simplified - Main features)
async function loadFacultyDashboard(loadOverview = true) {
    const container = document.getElementById('dashboardContent');
    
    if (!document.getElementById('facultyContent')) {
        const user = getCurrentUser();
        container.innerHTML = `
            <div class="welcome-text mb-4">
                <h2>Welcome back, ${user.full_name} 👋</h2>
                <p>Ready to manage your courses today?</p>
            </div>
            <div id="facultyContent"></div>
        `;
    }
    
    if (loadOverview) {
        showFacultySection('overview');
    }
}

async function showFacultySection(section) {
    const content = document.getElementById('facultyContent');
    if (!content) return;

    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        switch (section) {
            case 'overview':
                await showFacultyOverview(content);
                break;
            case 'courses':
                await showFacultyCourses(content);
                break;
            case 'students':
                await showFacultyStudents(content);
                break;
            case 'attendance':
                await showFacultyAttendance(content);
                break;
            case 'assignments':
                await showFacultyAssignments(content);
                break;
            case 'results':
                await showFacultyResults(content);
                break;
            case 'notices':
                await showFacultyNotices(content);
                break;
            case 'profile':
                await showFacultyProfile(content);
                break;
            default:
                content.innerHTML = `<div class="alert alert-info">The ${section} section is under development for faculty.</div>`;
        }
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function showFacultyOverview(content) {
    try {
        const [courseData, statsData] = await Promise.all([
            facultyAPI.getCourses(),
            facultyAPI.getStats()
        ]);
        
        content.innerHTML = `
            <div class="summary-cards-grid">
                <div class="edu-card card-teal">
                    <div class="card-label">Overall Passing Rate</div>
                    <div class="card-value">92%</div>
                    <div class="card-subtext">Across ${courseData.courses.length} courses</div>
                    <div class="card-icon-bg"><i class="fas fa-chart-line"></i></div>
                </div>
                
                <div class="edu-card card-orange">
                    <div class="card-label">Pending Grades</div>
                    <div class="card-value">14</div>
                    <div class="card-subtext">Submissions to review</div>
                    <div class="card-icon-bg"><i class="fas fa-edit"></i></div>
                </div>
                
                <div class="edu-card card-green" onclick="showFacultySection('students')" style="cursor: pointer;">
                    <div class="card-label">Total Students</div>
                    <div class="card-value">${statsData.total_students}</div>
                    <div class="card-subtext">Active this semester</div>
                    <div class="card-icon-bg"><i class="fas fa-users"></i></div>
                </div>
                
                <div class="edu-card card-white">
                    <div class="card-label">Active Courses</div>
                    <div class="card-value">${courseData.courses.length}</div>
                    <div class="card-subtext">Teaching status active</div>
                    <div class="card-icon-bg"><i class="fas fa-chalkboard-teacher"></i></div>
                </div>
            </div>
            
            <div class="dashboard-grid mt-4">
                <div class="content-card">
                    ${await getFacultyCoursesHTML(courseData)}
                </div>
                <div class="content-card">
                    <div class="card-title">Teaching Schedule</div>
                    <div class="notice-list">
                        <div class="notice-item">
                            <div class="notice-item-title">Data Structures Lecture</div>
                            <div class="notice-meta">
                                <span class="category-badge">Room 402</span>
                                <span class="notice-date">10:00 AM - 11:30 AM</span>
                            </div>
                        </div>
                        <div class="notice-item">
                            <div class="notice-item-title">Algorithm Lab</div>
                            <div class="notice-meta">
                                <span class="category-badge">Lab B</span>
                                <span class="notice-date">02:00 PM - 04:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast('Error loading overview: ' + error.message, 'danger');
    }
}

async function getFacultyCoursesHTML(data) {
    return `
        <div class="card-title">My Courses</div>
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th class="px-0">Code</th>
                        <th>Course Name</th>
                        <th class="text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.courses.map(course => `
                        <tr>
                            <td class="px-0 fw-medium">${course.course_code}</td>
                            <td>${course.course_name}</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="manageCourse(${course.id})">
                                    Manage
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function showFacultyCourses(content) {
    const data = await facultyAPI.getCourses();
    content.innerHTML = `
        <div class="content-card">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-0 mb-4">
                <h5 class="mb-0 fw-bold"><i class="fas fa-book text-primary me-2"></i> Course Management</h5>
                <button class="btn btn-primary btn-sm rounded-pill" onclick="showCreateCourseModal()">
                    <i class="fas fa-plus me-1"></i> Create Course
                </button>
            </div>
            ${await getFacultyCoursesHTML(data)}
        </div>
    `;
}

async function showFacultyStudents(content) {
    try {
        const [courseData, studentData] = await Promise.all([
            facultyAPI.getCourses(),
            facultyAPI.getStudents()
        ]);
        
        content.innerHTML = `
            <div class="content-card">
                <div class="card-title mb-4">Students Management</div>
                
                <div class="mb-5">
                    <h6 class="fw-bold mb-3"><i class="fas fa-list me-2 text-primary"></i> All Registered Students</h6>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th class="text-center">Year/Sem</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentData.students.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No students registered yet.</td></tr>' : 
                                    studentData.students.map(s => `
                                    <tr>
                                        <td class="fw-bold text-primary">${s.student_id}</td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 12px; font-weight: bold;">
                                                    ${s.user.full_name.charAt(0)}
                                                </div>
                                                ${s.user.full_name}
                                            </div>
                                        </td>
                                        <td>${s.user.email}</td>
                                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${s.department || 'N/A'}</span></td>
                                        <td class="text-center">Y${s.year || '-'}/S${s.semester || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card-title mb-4 mt-5">View Enrolled Students by Course</div>
                <p class="text-muted mb-4">Detailed enrollment and grading view for your assigned courses.</p>
                <div class="row g-4">
                    ${courseData.courses.map(course => `
                        <div class="col-md-6 col-lg-4">
                            <div class="edu-card card-white h-100 p-4" style="cursor: pointer;" onclick="loadCourseStudents(${course.id})">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="card-icon-bg"><i class="fas fa-users text-primary"></i></div>
                                    <div class="ms-3">
                                        <div class="fw-bold">${course.course_code}</div>
                                        <div class="small text-muted">${course.course_name}</div>
                                    </div>
                                </div>
                                <div class="mt-auto pt-3 border-top text-primary small d-flex justify-content-between">
                                    <span>Check Enrollment</span>
                                    <i class="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div id="courseStudentsDetails" class="mt-5"></div>
            </div>
        `;
    } catch (error) {
        showToast('Error loading students: ' + error.message, 'danger');
    }
}

async function showFacultyAttendance(content) {
    const data = await facultyAPI.getCourses();
    
    if (!data.courses || data.courses.length === 0) {
        data.courses = [
            { id: 999, course_code: 'CS101', course_name: 'Introduction to Computer Science' }
        ];
    }

    content.innerHTML = `
        <div class="d-flex align-items-center mb-4 mt-2">
            <h4 class="fw-bold m-0"><i class="fas fa-user-check text-info me-2"></i> Attendance Registry</h4>
        </div>
        <div class="row g-4">
            ${data.courses.map(course => {
                const now = new Date();
                const defaultDateTime = now.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:MM
                const displayDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                return `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm bg-white rounded-4 overflow-hidden" style="transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                        <div class="bg-primary bg-opacity-10 p-4 border-bottom border-primary border-opacity-25">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary rounded-pill px-3 py-2">${course.course_code}</span>
                                <div class="position-relative">
                                    <i class="fas fa-calendar-alt text-primary fs-4 cursor-pointer" onclick="document.getElementById('dateInput_${course.id}').showPicker()" style="cursor: pointer;" title="Select Date & Time"></i>
                                    <input type="datetime-local" id="dateInput_${course.id}" class="position-absolute opacity-0" style="left:0; top:0; width:0; height:0;" value="${defaultDateTime}" onchange="updateAttendanceDisplay(${course.id}, this.value)">
                                </div>
                            </div>
                            <h5 class="fw-bold mb-0 text-truncate text-dark mt-3">${course.course_name}</h5>
                            <div class="mt-2 small text-primary fw-medium" id="dateDisplay_${course.id}">
                                <i class="far fa-clock me-1"></i> ${displayDate}
                            </div>
                        </div>
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex align-items-center mb-4 text-muted small">
                                <i class="fas fa-users me-2"></i>
                                <span class="ms-2">Record student attendance</span>
                            </div>
                            <button class="btn btn-outline-primary rounded-pill w-100 mt-auto shadow-sm fw-bold" onclick="manageAttendance(${course.id}, document.getElementById('dateInput_${course.id}').value)">
                                <i class="fas fa-clipboard-check me-2"></i> Mark Attendance
                            </button>
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;

    // Helper to update display after selection
    window.updateAttendanceDisplay = (courseId, value) => {
        const display = document.getElementById(`dateDisplay_${courseId}`);
        if(display && value) {
            const date = new Date(value);
            const str = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            display.innerHTML = `<i class="far fa-clock me-1"></i> ${str}`;
        }
    };
}

async function showFacultyAssignments(content) {
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-warning" role="status"></div></div>';
    
    try {
        const [courseData, assignmentData] = await Promise.all([
            facultyAPI.getCourses(),
            facultyAPI.getAssignments()
        ]);
        
        const courses = courseData.courses || [];
        const assignments = assignmentData.assignments || [];

        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
                <h4 class="fw-bold m-0"><i class="fas fa-tasks text-warning me-2"></i> Assignment Tracking</h4>
                <button class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" onclick="showCreateAssignmentModal()">
                    <i class="fas fa-plus me-2"></i> Create New
                </button>
            </div>
            
            ${assignments.length === 0 ? `
                <div class="card border-0 shadow-sm mt-4 rounded-4 overflow-hidden">
                    <div class="card-body text-center p-5">
                        <i class="fas fa-edit fa-4x text-muted mb-3 opacity-25"></i>
                        <h5 class="text-secondary fw-bold">No Assignments Issued</h5>
                        <p class="text-muted">Start by creating your first course assignment above.</p>
                    </div>
                </div>` : `
                <div class="row g-4">
                    ${assignments.map(a => `
                        <div class="col-12">
                            <div class="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-warning border-5" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div class="card-body p-4">
                                    <div class="row align-items-center">
                                        <div class="col-md-8 mb-3 mb-md-0">
                                            <div class="d-flex align-items-center gap-2 mb-2">
                                                <span class="badge bg-warning text-dark opacity-75">${a.course ? a.course.course_code : 'Course'}</span>
                                                <h5 class="fw-bold m-0">${a.title}</h5>
                                            </div>
                                            <p class="text-muted mb-3">${a.description || 'No description provided.'}</p>
                                            <div class="d-flex text-muted small gap-4">
                                                <div><i class="far fa-calendar-alt me-1 text-warning"></i> Due: <span class="fw-medium text-dark">${new Date(a.due_date).toLocaleDateString()}</span></div>
                                                <div><i class="fas fa-star me-1 text-warning"></i> Max Points: <span class="fw-medium text-dark">${a.max_marks}</span></div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 text-md-end">
                                            <button class="btn btn-outline-warning rounded-pill px-4" onclick="manageSubmissions(${a.id})">
                                                <i class="fas fa-user-edit me-2"></i> Submissions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        `;
    } catch (e) {
        showToast('Error loading assignments: ' + e.message, 'danger');
    }
}

async function showCreateAssignmentModal() {
    try {
        const data = await facultyAPI.getCourses();
        const courses = data.courses || [];
        
        if (courses.length === 0) {
            showToast('You must have an assigned course to create an assignment.', 'warning');
            return;
        }

        let modal = document.getElementById('createAssignmentModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'createAssignmentModal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-warning text-dark border-0">
                            <h5 class="modal-title fw-bold"><i class="fas fa-plus-circle me-2"></i> Issue New Assignment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="createAssignmentForm">
                                <div class="mb-3">
                                    <label class="form-label fw-medium">Select Course</label>
                                    <select class="form-select border-2" name="course_id" required id="assignmentCourseSelect"></select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-medium">Assignment Title</label>
                                    <input type="text" class="form-control border-2" name="title" required placeholder="e.g., Final Project Proposal">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-medium">Instructions / Description</label>
                                    <textarea class="form-control border-2" name="description" rows="3" placeholder="Provide clear task instructions..."></textarea>
                                </div>
                                <div class="row mb-4">
                                    <div class="col-6">
                                        <label class="form-label fw-medium">Due Date</label>
                                        <input type="date" class="form-control border-2" name="due_date" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label fw-medium">Max Marks</label>
                                        <input type="number" class="form-control border-2" name="max_marks" value="100" required>
                                    </div>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-warning py-2 fw-bold text-dark rounded-pill">Create & Send to Students</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('createAssignmentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const courseId = formData.get('course_id');
                
                try {
                    await facultyAPI.createAssignment(courseId, {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        due_date: formData.get('due_date'),
                        max_marks: parseInt(formData.get('max_marks'))
                    });
                    showToast('Assignment created and published!', 'success');
                    bootstrap.Modal.getInstance(modal).hide();
                    showFacultySection('assignments');
                } catch (error) {
                    showToast(error.message, 'danger');
                }
            });
        }

        const select = document.getElementById('assignmentCourseSelect');
        select.innerHTML = courses.map(c => `<option value="${c.id}">${c.course_code} - ${c.course_name}</option>`).join('');
        
        document.getElementById('createAssignmentForm').reset();
        new bootstrap.Modal(modal).show();
    } catch (e) {
        showToast('Error loading courses: ' + e.message, 'danger');
    }
}

async function manageSubmissions(assignmentId) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-warning" role="status"></div></div>';
    
    try {
        const data = await facultyAPI.getSubmissions(assignmentId);
        const submissions = data.submissions || [];
        
        // Get assignment title from first submission or fetch it if needed
        // For now, we'll just show the list
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
                <h4 class="fw-bold m-0"><i class="fas fa-file-invoice text-warning me-2"></i> Review Submissions</h4>
                <button class="btn btn-outline-secondary rounded-pill px-4 fw-bold" onclick="showFacultySection('assignments')">
                    <i class="fas fa-arrow-left me-2"></i> Back to assignments
                </button>
            </div>
            
            ${submissions.length === 0 ? `
                <div class="card border-0 shadow-sm mt-4 rounded-4 overflow-hidden">
                    <div class="card-body text-center p-5">
                        <i class="fas fa-user-clock fa-4x text-muted mb-3 opacity-25"></i>
                        <h5 class="text-secondary fw-bold">No Submissions Yet</h5>
                        <p class="text-muted">Students haven't submitted their work for this assignment.</p>
                    </div>
                </div>` : `
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                    <tr>
                                        <th class="ps-4 py-3">Student Name</th>
                                        <th class="py-3">Files/Path</th>
                                        <th class="py-3">Submitted Date</th>
                                        <th class="py-3">Status</th>
                                        <th class="py-3">Score</th>
                                        <th class="pe-4 text-end py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${submissions.map(s => `
                                        <tr>
                                            <td class="ps-4">
                                                <div class="d-flex align-items-center gap-3">
                                                    <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                                                        ${s.student.user.full_name[0]}
                                                    </div>
                                                    <div>
                                                        <div class="fw-bold">${s.student.user.full_name}</div>
                                                        <small class="text-muted">${s.student.student_id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="text-truncate" style="max-width: 150px;" title="${s.file_path || 'No file uploaded'}">
                                                    ${s.file_path ? `
                                                        <a href="/api/submissions/download/${s.id}" class="text-primary text-decoration-none small fw-medium" target="_blank">
                                                            <i class="fas fa-file-download me-1"></i> ${s.file_path.split('/').pop()}
                                                        </a>
                                                    ` : '<span class="text-muted small">No file</span>'}
                                                </div>
                                            </td>
                                            <td>${new Date(s.submitted_at).toLocaleString()}</td>
                                            <td>
                                                ${s.marks !== null ? 
                                                    `<span class="badge bg-success bg-opacity-10 text-success rounded-pill border border-success px-3">Graded</span>` : 
                                                    `<span class="badge bg-warning bg-opacity-10 text-warning rounded-pill border border-warning px-3">Pending</span>`}
                                            </td>
                                            <td class="fw-bold text-primary">
                                                ${s.marks !== null ? `${s.marks} / ${s.assignment.max_marks}` : '-'}
                                            </td>
                                            <td class="pe-4 text-end">
                                                <button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onclick="showGradeSubmissionModal(${s.id}, ${JSON.stringify(s).replace(/"/g, '&quot;')})">
                                                    <i class="fas fa-star me-1"></i> ${s.marks !== null ? 'Re-grade' : 'Grade Now'}
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `}
        `;
    } catch (e) {
        showToast('Error loading submissions: ' + e.message, 'danger');
    }
}

async function showGradeSubmissionModal(submissionId, submissionData) {
    let modal = document.getElementById('gradeSubmissionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'gradeSubmissionModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header bg-primary text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="fas fa-check-circle me-2"></i> Grade Submission</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-4 bg-light p-3 rounded-3">
                            <h6 class="fw-bold text-dark mb-1" id="gradeStudentName"></h6>
                            <small class="text-muted d-block" id="gradeAssignmentTitle"></small>
                            <div class="mt-2 small text-primary fw-medium" id="gradeFileLink"></div>
                        </div>
                        <form id="gradeSubmissionForm">
                            <input type="hidden" name="submission_id">
                            <div class="mb-3">
                                <label class="form-label fw-medium">Score (Max: <span id="gradeMaxMarks"></span>)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control border-2" name="marks" required min="0">
                                    <span class="input-group-text bg-light border-2" id="gradeMaxDisplay"></span>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-medium">Feedback / Comments</label>
                                <textarea class="form-control border-2" name="feedback" rows="4" placeholder="Excellent work, keep it up!"></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary py-2 fw-bold rounded-pill">Submit Grade & Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('gradeSubmissionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const subId = formData.get('submission_id');
            const assignmentId = modal.dataset.assignmentId;
            
            try {
                await facultyAPI.gradeSubmission(subId, {
                    marks: parseInt(formData.get('marks')),
                    feedback: formData.get('feedback')
                });
                showToast('Grade submitted successfully!', 'success');
                bootstrap.Modal.getInstance(modal).hide();
                manageSubmissions(assignmentId);
            } catch (error) {
                showToast(error.message, 'danger');
            }
        });
    }

    // Set data in modal
    document.getElementById('gradeStudentName').textContent = submissionData.student.user.full_name;
    document.getElementById('gradeAssignmentTitle').textContent = submissionData.assignment.title;
    document.getElementById('gradeMaxMarks').textContent = submissionData.assignment.max_marks;
    document.getElementById('gradeMaxDisplay').textContent = `/ ${submissionData.assignment.max_marks}`;
    document.getElementById('gradeFileLink').textContent = submissionData.file_path ? `Work: ${submissionData.file_path}` : 'No file provided';
    
    modal.dataset.assignmentId = submissionData.assignment_id;
    
    const form = document.getElementById('gradeSubmissionForm');
    form.elements['submission_id'].value = submissionId;
    form.elements['marks'].value = submissionData.marks || '';
    form.elements['marks'].max = submissionData.assignment.max_marks;
    form.elements['feedback'].value = submissionData.feedback || '';

    new bootstrap.Modal(modal).show();
}


async function showFacultyResults(content) {
    const data = await facultyAPI.getCourses();
    content.innerHTML = `
        <div class="content-card">
            <div class="card-title mb-4">Gradebook & Results</div>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th class="px-0">Course Code</th>
                            <th>Course Name</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.courses.map(course => `
                            <tr>
                                <td class="px-0 fw-bold">${course.course_code}</td>
                                <td>${course.course_name}</td>
                                <td class="text-center">
                                    <button class="btn btn-outline-success btn-sm rounded-pill px-3" onclick="showGradebook(${course.id})">
                                        View Gradebook
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function showFacultyNotices(content) {
    try {
        const data = await facultyAPI.getAnnouncements();
        
        if (!data.announcements || data.announcements.length === 0) {
            content.innerHTML = `
                <div class="content-card">
                    <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-0 mb-4">
                        <h5 class="mb-0 fw-bold"><i class="fas fa-bullhorn text-danger me-2"></i> Faculty Announcements</h5>
                        <button class="btn btn-primary btn-sm rounded-pill" onclick="showCreateAnnouncementModal()">
                            <i class="fas fa-plus me-1"></i> Create New
                        </button>
                    </div>
                    <div class="card border-0 mt-4">
                        <div class="card-body text-center p-5">
                            <i class="fas fa-bullhorn fa-4x text-muted mb-3"></i>
                            <h4 class="text-secondary fw-bold">No Notices Available</h4>
                            <p class="text-muted">Not Provided by the admin</p>
                        </div>
                    </div>
                </div>`;
            return;
        }

        content.innerHTML = `
            <div class="content-card">
                <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-0 mb-4">
                    <h5 class="mb-0 fw-bold"><i class="fas fa-bullhorn text-danger me-2"></i> Faculty Announcements</h5>
                    <button class="btn btn-primary btn-sm rounded-pill" onclick="showCreateAnnouncementModal()">
                        <i class="fas fa-plus me-1"></i> Create New
                    </button>
                </div>
                <div class="row g-4">
                    ${data.announcements.map(n => `
                        <div class="col-12">
                            <div class="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-danger border-5" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div class="card-body p-4">
                                    <div class="row align-items-center">
                                        <div class="col-md-9 mb-3 mb-md-0">
                                            <h5 class="fw-bold mb-2">${n.title}</h5>
                                            <p class="text-muted mb-3 w-100">${n.content}</p>
                                            <div class="d-flex text-muted small">
                                                <div class="me-4"><i class="fas fa-user me-1 text-primary"></i> <span class="fw-medium text-dark">${n.author.full_name}</span></div>
                                                <div><i class="fas fa-clock me-1 text-warning"></i> <span class="fw-medium text-dark">${new Date(n.created_at).toLocaleString()}</span></div>
                                            </div>
                                        </div>
                                        <div class="col-md-3 text-md-end text-start">
                                            <span class="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill border border-danger">
                                                <i class="fas fa-info-circle me-1"></i> Notice
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = '<div class="alert alert-danger">Error loading announcements</div>';
    }
}

async function showFacultyProfile(content) {
    try {
        const data = await facultyAPI.getProfile();
        const user = getCurrentUser();
        
        content.innerHTML = `
            <div class="content-card">
                <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-0 mb-4">
                    <h5 class="mb-0 fw-bold"><i class="fas fa-user-circle text-primary me-2"></i> Faculty Profile</h5>
                </div>
                <div class="row">
                    <div class="col-md-4 text-center mb-4">
                        <div class="profile-avatar mx-auto mb-3" style="width: 150px; height: 150px; font-size: 4rem;">
                            ${user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <h4 class="fw-bold">${user.full_name}</h4>
                        <span class="badge bg-primary px-3 py-2 rounded-pill">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </div>
                    <div class="col-md-8">
                        <div class="table-responsive">
                            <table class="table table-borderless">
                                <tbody>
                                    <tr>
                                        <th class="ps-0 text-muted" style="width: 150px;">Faculty ID</th>
                                        <td class="fw-bold">${data.profile.faculty_id}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Full Name</th>
                                        <td>${data.profile.user.full_name}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Email Address</th>
                                        <td>${data.profile.user.email}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Department</th>
                                        <td>${data.profile.department || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Designation</th>
                                        <td>${data.profile.designation || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Join Date</th>
                                        <td>${new Date(data.profile.user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = '<div class="alert alert-danger">Error loading profile</div>';
    }
}

// Admin Dashboard (Simplified - Main features)
async function loadAdminDashboard() {
    const container = document.getElementById('dashboardContent');
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getAnalytics();
        const user = getCurrentUser();
        
        container.innerHTML = `
            <div class="welcome-text mb-4">
                <h2>Welcome back, ${user.full_name} 👋</h2>
                <p>Here's what's happening today</p>
            </div>
            
            <div class="summary-cards-grid">
                <div class="edu-card card-teal" onclick="showAdminStudents()">
                    <div class="card-label">Overall Attendance</div>
                    <div class="card-value">94.2%</div>
                    <div class="card-subtext"><i class="fas fa-arrow-up me-1"></i> 2.1% from last semester</div>
                    <div class="card-icon-bg"><i class="fas fa-calendar-check"></i></div>
                </div>
                
                <div class="edu-card card-orange" onclick="showAdminAssignments()">
                    <div class="card-label">Active Assignments</div>
                    <div class="card-value">${data.overview.total_assignments}</div>
                    <div class="card-subtext"><i class="fas fa-clock me-1"></i> 5 pending review</div>
                    <div class="card-icon-bg"><i class="fas fa-file-signature"></i></div>
                </div>
                
                <div class="edu-card card-green" onclick="showAdminStudents()">
                    <div class="card-label">Total Students</div>
                    <div class="card-value">${data.overview.total_students}</div>
                    <div class="card-subtext"><i class="fas fa-user-plus me-1"></i> 12 new this week</div>
                    <div class="card-icon-bg"><i class="fas fa-graduation-cap"></i></div>
                </div>
                
                <div class="edu-card card-white" onclick="showAdminCourses()">
                    <div class="card-label">Total Courses</div>
                    <div class="card-value">${data.overview.total_courses}</div>
                    <div class="card-subtext">Across 8 departments</div>
                    <div class="card-icon-bg"><i class="fas fa-book-reader"></i></div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="content-card">
                    <div class="card-title">Academic Performance</div>
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
                
                <div class="content-card">
                    <div class="card-title">Recent Notices</div>
                    <div class="notice-list" id="recentNoticesList">
                        <!-- Notices populated here -->
                    </div>
                </div>
            </div>
        `;
        
        // Create Performance Chart
        createPerformanceChart();
        
        // Load Notices
        loadRecentNotices();
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${error.message}</div>`;
    }
}

function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            datasets: [{
                label: 'GPA',
                data: [3.4, 3.5, 3.6, 3.7, 3.65, 3.8],
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                borderWidth: 4,
                tension: 0.4,
                pointBackgroundColor: '#2dd4bf',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1f2c',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    min: 3,
                    max: 4,
                    ticks: { 
                        stepSize: 0.25,
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif" }
                    },
                    grid: { color: '#f1f5f9', drawBorder: false }
                },
                x: {
                    ticks: { 
                        color: '#64748b',
                        font: { family: "'Inter', sans-serif" }
                    },
                    grid: { display: false, drawBorder: false }
                }
            }
        }
    });
}

async function loadRecentNotices() {
    const list = document.getElementById('recentNoticesList');
    if (!list) return;
    
    try {
        const data = await adminAPI.getAnnouncements();
        const notices = data.announcements.slice(0, 4);
        
        list.innerHTML = notices.map(n => `
            <div class="notice-item">
                <div class="notice-item-title">${n.title}</div>
                <div class="notice-meta">
                    <span class="category-badge">${n.author.full_name}</span>
                    <span class="notice-date"><i class="far fa-clock me-1"></i>${new Date(n.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('') || '<p class="text-muted text-center py-4">No recent notices</p>';
    } catch (error) {
        list.innerHTML = '<p class="text-danger">Failed to load notices</p>';
    }
}

function createDepartmentChart(data) {
    const ctx = document.getElementById('deptChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.department),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
            }]
        }
    });
}

function createEnrollmentChart(data) {
    const ctx = document.getElementById('enrollmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.course),
            datasets: [{
                label: 'Enrollments',
                data: data.map(d => d.enrollments),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Admin Detailed Views
async function showAdminProfile() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getProfile();
        const user = data.profile;
        
        content.innerHTML = `
            <div class="content-card">
                <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-0 mb-4">
                    <h5 class="mb-0 fw-bold"><i class="fas fa-user-shield text-primary me-2"></i> Admin Profile</h5>
                </div>
                <div class="row">
                    <div class="col-md-4 text-center mb-4">
                        <div class="profile-avatar mx-auto mb-3" style="width: 150px; height: 150px; font-size: 4rem;">
                            ${user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <h4 class="fw-bold">${user.full_name}</h4>
                        <span class="badge bg-dark px-3 py-2 rounded-pill">System Administrator</span>
                    </div>
                    <div class="col-md-8">
                        <div class="table-responsive">
                            <table class="table table-borderless">
                                <tbody>
                                    <tr>
                                        <th class="ps-0 text-muted" style="width: 150px;">Username</th>
                                        <td class="fw-bold">${user.username}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Full Name</th>
                                        <td>${user.full_name}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Email Address</th>
                                        <td>${user.email}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Role</th>
                                        <td>${user.role}</td>
                                    </tr>
                                    <tr>
                                        <th class="ps-0 text-muted">Join Date</th>
                                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        content.innerHTML = '<div class="alert alert-danger">Error loading profile</div>';
    }
}
async function showAdminStudents() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getStudents();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-user-graduate"></i> Student List</h4>
                <button class="btn btn-outline-secondary" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.students.map(s => `
                                    <tr>
                                        <td>${s.student_id}</td>
                                        <td>${s.user.full_name}</td>
                                        <td>${s.user.email}</td>
                                        <td>${s.department || 'N/A'}</td>
                                        <td>${s.year || 'N/A'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student? This will also delete their user account.')) {
        try {
            await adminAPI.deleteStudent(id);
            showToast('Student deleted successfully', 'success');
            showAdminStudents();
        } catch (error) {
            showToast(error.message, 'danger');
        }
    }
}

async function showAdminFaculty() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getFaculty();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-chalkboard-teacher"></i> Faculty List</h4>
                <button class="btn btn-outline-secondary" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Courses Provided</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.faculty.map(f => `
                                    <tr>
                                        <td>${f.faculty_id}</td>
                                        <td>${f.user.full_name}</td>
                                        <td>${f.user.email}</td>
                                        <td>${f.department || 'N/A'}</td>
                                        <td>${f.designation || 'N/A'}</td>
                                        <td><span class="badge bg-info text-dark">${f.course_count}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-danger" onclick="deleteFaculty(${f.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function deleteFaculty(id) {
    if (confirm('Are you sure you want to delete this faculty? This will also delete their user account.')) {
        try {
            await adminAPI.deleteFaculty(id);
            showToast('Faculty deleted successfully', 'success');
            showAdminFaculty();
        } catch (error) {
            showToast(error.message, 'danger');
        }
    }
}

async function showAdminCourses() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getCourses();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-book"></i> Course List</h4>
                <button class="btn btn-outline-secondary" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Instructor</th>
                                    <th>Credits</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.courses.map(c => `
                                    <tr>
                                        <td>${c.course_code}</td>
                                        <td>${c.course_name}</td>
                                        <td>${c.instructor ? c.instructor.user.full_name : 'Not Assigned'}</td>
                                        <td>${c.credits}</td>
                                        <td>
                                            <button class="btn btn-sm btn-danger" onclick="deleteCourse(${c.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            await adminAPI.deleteCourse(id);
            showToast('Course deleted successfully', 'success');
            showAdminCourses();
        } catch (error) {
            showToast(error.message, 'danger');
        }
    }
}

async function showAdminAssignments() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getAssignments();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-tasks"></i> Assignment List</h4>
                <button class="btn btn-outline-secondary" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Course</th>
                                    <th>Providing Faculty</th>
                                    <th>Due Date</th>
                                    <th>Max Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.assignments.map(a => `
                                    <tr>
                                        <td>${a.title}</td>
                                        <td>${a.course.course_name} (${a.course.course_code})</td>
                                        <td>${a.course.instructor ? a.course.instructor.user.full_name : 'N/A'}</td>
                                        <td>${new Date(a.due_date).toLocaleDateString()}</td>
                                        <td>${a.max_marks}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function showAdminAttendance() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getAttendance();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-calendar-check text-primary me-2"></i> System Attendance</h4>
                <button class="btn btn-outline-secondary rounded-pill" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th>Student Name</th>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Year</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.attendance.map(r => `
                                    <tr>
                                        <td class="fw-bold">${r.student_name}</td>
                                        <td>${r.student_id}</td>
                                        <td>${r.department || 'N/A'}</td>
                                        <td>${r.year || 'N/A'}</td>
                                        <td>${r.course}</td>
                                        <td>${new Date(r.date).toLocaleDateString()}</td>
                                        <td>
                                            <span class="badge rounded-pill ${r.status === 'present' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}" style="font-size: 0.8rem; padding: 6px 12px;">
                                                ${r.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="7" class="text-center py-4">No attendance records found.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function showAdminResults() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getResults();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-chart-line text-success me-2"></i> Student Results</h4>
                <button class="btn btn-outline-secondary rounded-pill" onclick="loadAdminDashboard()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th>Student Name</th>
                                    <th>ID</th>
                                    <th>Course</th>
                                    <th>Course Code</th>
                                    <th class="text-center">Assignment Scores</th>
                                    <th class="text-center">Final Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.results.map(r => `
                                    <tr>
                                        <td class="fw-bold text-dark">${r.student_name}</td>
                                        <td class="text-secondary small">${r.student_id}</td>
                                        <td class="small">${r.course_name}</td>
                                        <td><code class="text-primary">${r.course_code}</code></td>
                                        <td class="text-center">
                                            <div class="d-flex flex-wrap justify-content-center gap-2">
                                                ${r.assignments.length > 0 ? r.assignments.map(a => `
                                                    <div class="small px-2 py-1 rounded-pill ${a.status === 'Submitted' ? 'bg-light border' : 'bg-danger-subtle text-danger'}" title="${a.title}">
                                                        ${a.status === 'Submitted' ? 
                                                            `<span class="fw-bold">${a.marks !== null ? a.marks : 'PK'}</span><span class="text-muted">/${a.max}</span>` : 
                                                            'Not Submitted'}
                                                    </div>
                                                `).join('') : '<span class="text-muted small">No assignments yet</span>'}
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge ${r.grade === 'A' ? 'bg-success' : r.grade === 'B' ? 'bg-primary' : 'bg-warning'} px-3 py-2 rounded-pill shadow-sm">
                                                ${r.grade || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" class="text-center py-4">No results found.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function showAdminNotices() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        const data = await adminAPI.getAnnouncements();
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4><i class="fas fa-bullhorn text-warning me-2"></i> Announcements Management</h4>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary rounded-pill px-4" onclick="showCreateAnnouncementModal()">
                        <i class="fas fa-plus me-2"></i> Create Notice
                    </button>
                    <button class="btn btn-outline-secondary rounded-pill" onclick="loadAdminDashboard()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Target</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.announcements.map(n => `
                                    <tr>
                                        <td class="fw-bold">${n.title}</td>
                                        <td>${n.author.full_name} (${n.author.role})</td>
                                        <td>
                                            <span class="badge bg-secondary-subtle text-secondary rounded-pill px-3">
                                                ${n.target_role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>${new Date(n.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteAnnouncement(${n.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5" class="text-center py-4">No announcements found.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        try {
            await adminAPI.deleteAnnouncement(id);
            showToast('Announcement deleted successfully', 'success');
            showAdminNotices();
            fetchAndShowNotifications();
        } catch (error) {
            showToast(error.message, 'danger');
        }
    }
}

// Faculty Helper Functions

async function loadCourseStudents(courseId) {
    const detailsContainer = document.getElementById('courseStudentsDetails');
    detailsContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
        const data = await facultyAPI.getCourseStudents(courseId);
        detailsContainer.innerHTML = `
            <div class="content-card border-top pt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold"><i class="fas fa-user-graduate me-2"></i> Enrolled Students</h5>
                    <button class="btn btn-sm btn-outline-secondary" onclick="document.getElementById('courseStudentsDetails').innerHTML=''">Close List</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="bg-light">
                            <tr>
                                <th class="px-0">ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th class="text-center">Current Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.students.map(s => `
                                <tr>
                                    <td class="px-0">${s.student_id}</td>
                                    <td class="fw-bold">${s.user.full_name}</td>
                                    <td>${s.department}</td>
                                    <td class="text-center">
                                        <span class="badge ${s.enrollment.grade === 'A' ? 'bg-success' : 'bg-primary'}">${s.enrollment.grade || 'N/A'}</span>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" class="text-center py-4">No students enrolled yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function manageAttendance(courseId, selectedDate) {
    const content = document.getElementById('facultyContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div></div>';
    
    try {
        let courseData = { courses: [] };
        let studentsData = { students: [] };
        
        try {
            const results = await Promise.all([
                facultyAPI.getCourses(),
                facultyAPI.getCourseStudents(courseId)
            ]);
            if (results[0]) courseData = results[0];
            if (results[1]) studentsData = results[1];
        } catch (e) {
            console.warn("Using fallback demo data");
        }
        
        let course = courseData.courses && courseData.courses.find(c => c.id === courseId);
        if (!course && courseId === 999) {
            course = { id: 999, course_code: 'CS101', course_name: 'Introduction to Computer Science' };
        }
        
        const dateObj = selectedDate ? new Date(selectedDate) : new Date();
        const displayStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        content.innerHTML = `
            <div class="content-card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                <div class="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                    <div class="d-flex flex-column">
                        <h3 class="fw-bold m-0 d-flex align-items-center">
                            <i class="fas fa-arrow-left me-3 text-muted fs-5 cursor-pointer" onclick="showFacultySection('attendance')" style="cursor: pointer;"></i>
                            Mark Attendance
                        </h3>
                        <div class="text-muted small mt-2 ms-5">
                            <i class="far fa-calendar-alt me-1"></i> ${displayStr}
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="badge bg-light text-dark border px-4 py-2 rounded-pill fs-6 fw-medium d-flex align-items-center">
                            ${course ? course.course_code : 'Course'} <i class="fas fa-chevron-down ms-3 text-muted" style="font-size: 0.8rem;"></i>
                        </span>
                        <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm text-white" onclick="saveAttendance(${courseId}, '${selectedDate || ''}')" style="letter-spacing: 0.5px; background-color: #20b2aa; border-color: #20b2aa;">
                            Save
                        </button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-borderless align-middle" style="color: #4a5568;">
                        <thead>
                            <tr class="border-bottom" style="color: #a0aec0; font-weight: 500;">
                                <th class="pb-3 px-4 w-50" style="font-weight: 500;">Student</th>
                                <th class="pb-3 px-4 w-25" style="font-weight: 500;">Department</th>
                                <th class="pb-3 px-4 text-end" style="font-weight: 500;">Present</th>
                            </tr>
                        </thead>
                        <tbody id="attendanceList">
                            ${(studentsData.students && studentsData.students.length > 0) ? studentsData.students.map((s, index) => `
                                <tr class="border-bottom" style="border-bottom-color: #f1f5f9 !important;">
                                    <td class="py-4 px-4 fw-medium text-dark">${s.user.full_name}</td>
                                    <td class="py-4 px-4 text-muted">${s.department || 'N/A'}</td>
                                    <td class="py-4 px-4 text-end">
                                        <div class="form-check form-switch d-flex justify-content-end mb-0">
                                            <input class="form-check-input attendance-toggle" type="checkbox" role="switch" id="student_${s.id}" data-student-id="${s.id}" data-enrollment-id="${s.enrollment.id}" checked style="width: 2.5em; height: 1.25em; cursor: pointer;">
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="3" class="text-center py-5 text-muted">No students currently enrolled in this course.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Add custom styles for the toggle switches
        if (!document.getElementById('attendance-toggle-styles')) {
            const style = document.createElement('style');
            style.id = 'attendance-toggle-styles';
            style.innerHTML = `
                .attendance-toggle:checked {
                    background-color: #20b2aa !important;
                    border-color: #20b2aa !important;
                }
                .cursor-pointer:hover {
                    color: #20b2aa !important;
                }
            `;
            document.head.appendChild(style);
        }
        
    } catch (error) {
        content.innerHTML = `
            <div class="alert alert-danger shadow-sm border-0 rounded-4 mt-4">
                <i class="fas fa-exclamation-circle me-2"></i> Error loading attendance registry: ${error.message}
            </div>
            <div class="mt-3">
                <button class="btn btn-outline-primary rounded-pill px-4" onclick="showFacultySection('attendance')">
                    <i class="fas fa-arrow-left me-2"></i> Back to Registries
                </button>
            </div>
        `;
    }
}

async function saveAttendance(courseId, selectedDate) {
    const toggles = document.querySelectorAll('.attendance-toggle');
    const attendance_records = [];
    toggles.forEach(toggle => {
        attendance_records.push({
            student_id: parseInt(toggle.getAttribute('data-student-id')),
            status: toggle.checked ? 'present' : 'absent'
        });
    });
    
    if (attendance_records.length === 0) {
        showToast('No students to mark attendance for.', 'warning');
        return;
    }
    
    try {
        const dateValue = selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString();
        await facultyAPI.markAttendance(courseId, { 
            date: dateValue,
            attendance_records: attendance_records 
        });
        showToast('Attendance saved successfully!', 'success');
        showFacultySection('attendance');
    } catch (error) {
        showToast('Failed to save attendance: ' + error.message, 'danger');
    }
}

function manageAssignments(courseId) {
    showToast('Assignment management for course ' + courseId + ' is being integrated.', 'info');
}

async function showGradebook(courseId) {
    const content = document.getElementById('facultyContent');
    content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-success" role="status"></div></div>';
    
    try {
        const data = await facultyAPI.getGradebook(courseId);
        const assignments = data.assignments || [];
        const students = data.students || [];
        
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
                <h4 class="fw-bold m-0"><i class="fas fa-poll text-success me-2"></i> ${data.course_name} - Detailed Results</h4>
                <button class="btn btn-outline-secondary rounded-pill px-4 fw-bold" onclick="showFacultySection('results')">
                    <i class="fas fa-arrow-left me-2"></i> Back to Courses
                </button>
            </div>
            
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-4">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3">Student Name</th>
                                    <th class="py-3">Student ID</th>
                                    ${assignments.map(a => `
                                        <th class="py-3 text-center">
                                            ${a.title}<br>
                                            <small class="text-muted">Max: ${a.max_marks}</small>
                                        </th>
                                    `).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${students.map(s => `
                                    <tr>
                                        <td>
                                            <div class="fw-bold text-dark">${s.full_name}</div>
                                        </td>
                                        <td><span class="text-secondary small">${s.student_id}</span></td>
                                        ${s.results.map(r => `
                                            <td class="text-center">
                                                ${r.status === 'Submitted' ? `
                                                    <div class="fw-bold ${r.marks !== null ? 'text-primary' : 'text-warning'}">
                                                        ${r.marks !== null ? r.marks : 'Pending'}
                                                    </div>
                                                ` : `
                                                    <span class="badge bg-danger-subtle text-danger rounded-pill px-2">
                                                        Not Submitted
                                                    </span>
                                                `}
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('') || '<tr><td colspan="100%" class="text-center py-5">No students or assignments found.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast('Error loading gradebook: ' + error.message, 'danger');
        showFacultySection('results');
    }
}

function showCreateAnnouncementModal() {
    let modal = document.getElementById('createAnnouncementModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createAnnouncementModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white border-0">
                        <h5 class="modal-title fw-bold"><i class="fas fa-bullhorn me-2"></i> Create Notice</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="createAnnouncementForm">
                            <div class="mb-3">
                                <label class="form-label fw-medium">Notice Title</label>
                                <input type="text" class="form-control" name="title" required placeholder="Enter clear, concise title">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-medium">Description</label>
                                <textarea class="form-control" name="content" rows="4" required placeholder="Provide notice details..."></textarea>
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label fw-medium">Date</label>
                                    <input type="date" class="form-control" name="notice_date">
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-medium">Time</label>
                                    <input type="time" class="form-control" name="notice_time">
                                </div>
                                <div class="form-text mt-2">Optional date and time to attach to this notice.</div>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-medium">Target Audience</label>
                                <select class="form-select" name="target_role">
                                    <option value="all">All (Students & Faculty)</option>
                                    <option value="student" selected>Students Only</option>
                                    <option value="faculty">Faculty Only</option>
                                </select>
                            </div>
                            <div class="d-grid mt-2">
                                <button type="submit" class="btn btn-primary rounded-pill py-2 fw-bold">Publish Notice</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('createAnnouncementForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            let contentText = formData.get('content');
            const nDate = formData.get('notice_date');
            const nTime = formData.get('notice_time');
            
            if(nDate || nTime) {
                contentText += '\\n\\n---';
                if(nDate) contentText += '\\n📅 Date: ' + nDate;
                if(nTime) contentText += '\\n⏰ Time: ' + nTime;
            }

            try {
                const user = getCurrentUser();
                if (user.role === 'admin') {
                    await adminAPI.createAnnouncement({
                        title: formData.get('title'),
                        content: contentText,
                        target_role: formData.get('target_role')
                    });
                    showAdminNotices();
                } else {
                    await facultyAPI.createAnnouncement({
                        title: formData.get('title'),
                        content: contentText,
                        target_role: formData.get('target_role')
                    });
                    showFacultySection('notices');
                }
                showToast('Notice created successfully!', 'success');
                bootstrap.Modal.getInstance(modal).hide();
                fetchAndShowNotifications();
            } catch (error) {
                showToast('Error creating notice: ' + error.message, 'danger');
            }
        });
    }

    const modalInstance = new bootstrap.Modal(modal);
    document.getElementById('createAnnouncementForm').reset();
    modalInstance.show();
}

async function fetchAndShowNotifications() {
    const badge = document.getElementById('notificationBadge');
    
    if (!badge) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        let announcements = [];
        if (user.role === 'student') {
            const data = await studentAPI.getAnnouncements();
            announcements = data.announcements || [];
        } else if (user.role === 'faculty') {
            const data = await facultyAPI.getAnnouncements();
            announcements = data.announcements || [];
        } else {
            const data = await adminAPI.getAnnouncements();
            announcements = data.announcements || [];
        }

        // Show popup for students or faculty for new notices
        if (announcements.length > 0 && (user.role === 'student' || user.role === 'faculty')) {
            // Find the latest unseen announcement
            const storageKey = `seenNotices_${user.id}`;
            const seenNotices = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Filter out already seen notices
            const unseen = announcements.filter(a => !seenNotices.includes(a.id));
            
            if (unseen.length > 0) {
                // Show the most recent unseen notice
                showAnnouncementPopup(unseen[0], user.id);
            }
        }
        
        let count = announcements.length;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        }
    } catch (e) {
        console.error('Error loading notices for badge');
    }
}

function showAnnouncementPopup(announcement, userId) {
    // Remove existing popup if any
    const existing = document.getElementById('noticePopup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.id = 'noticePopup';
    popup.className = 'notice-popup';
    popup.innerHTML = `
        <div class="notice-popup-icon">
            <i class="fas fa-bullhorn"></i>
        </div>
        <div class="notice-popup-content" onclick="reviewAnnouncement(${announcement.id}, ${userId})">
            <div class="notice-popup-title">${announcement.title}</div>
            <div class="notice-popup-text">${announcement.content}</div>
        </div>
        <button class="notice-popup-close" onclick="dismissAnnouncement(${announcement.id}, ${userId})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(popup);
    
    // Animate in
    setTimeout(() => popup.classList.add('active'), 100);
}

function dismissAnnouncement(id, userId) {
    const storageKey = `seenNotices_${userId}`;
    const seenNotices = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!seenNotices.includes(id)) {
        seenNotices.push(id);
        localStorage.setItem(storageKey, JSON.stringify(seenNotices));
    }
    
    const popup = document.getElementById('noticePopup');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 500);
    }
}

function reviewAnnouncement(id, userId) {
    dismissAnnouncement(id, userId);
    loadDashboardSection('notices');
}

function handleNotificationClick() {
    // Clear the notification badge visually to mimic reading them
    const badge = document.getElementById('notificationBadge');
    if(badge) {
        badge.style.display = 'none';
        badge.textContent = '0';
    }
    
    // Navigate straight to notices section
    loadDashboardSection('notices');
}
