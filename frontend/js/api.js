// API Configuration
const API_BASE_URL = '/api';

// API Client
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.debug(`API Request: Setting Authorization header (token present)`);
        } else {
            console.warn(`API Request: No token found in localStorage`);
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.error || data.msg || 'Request failed');
                error.status = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            // Handle unauthorized error (401)
            if (error.status === 401 || (error.message && error.message.includes('401'))) {
                console.warn('Unauthorized access - logging out');
                if (typeof logout === 'function') {
                    logout();
                    location.reload();
                }
            }

            // Only log unexpected or server errors to console
            const isValidationError = error.message && (
                error.message.includes('already') ||
                error.message.includes('invalid') ||
                error.message.includes('required') ||
                error.message.includes('not found')
            );

            if (!isValidationError) {
                console.error('API Error:', error);
            }
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const api = new APIClient(API_BASE_URL);

// Auth API
const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getAdminCount: () => api.get('/auth/admin-count'),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (passwords) => api.post('/auth/change-password', passwords)
};

// Student API
const studentAPI = {
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data) => api.put('/student/profile', data),
    getCourses: () => api.get('/student/courses'),
    getAssignments: () => api.get('/student/assignments'),
    submitAssignment: (data) => api.post('/student/submit-assignment', data),
    getAttendance: () => api.get('/student/attendance'),
    getGrades: () => api.get('/student/grades'),
    getAnnouncements: () => api.get('/student/announcements')
};

// Faculty API
const facultyAPI = {
    getProfile: () => api.get('/faculty/profile'),
    getCourses: () => api.get('/faculty/courses'),
    createCourse: (data) => api.post('/faculty/courses', data),
    createAssignment: (courseId, data) => api.post(`/faculty/courses/${courseId}/assignments`, data),
    getSubmissions: (assignmentId) => api.get(`/faculty/assignments/${assignmentId}/submissions`),
    gradeSubmission: (submissionId, data) => api.post(`/faculty/submissions/${submissionId}/grade`, data),
    uploadMaterial: (courseId, data) => api.post(`/faculty/courses/${courseId}/materials`, data),
    markAttendance: (courseId, data) => api.post(`/faculty/courses/${courseId}/attendance`, data),
    getCourseStudents: (courseId) => api.get(`/faculty/courses/${courseId}/students`),
    getAssignments: () => api.get('/faculty/assignments'),
    getCourseAssignments: (courseId) => api.get(`/faculty/courses/${courseId}/assignments`),
    getAnnouncements: () => api.get('/faculty/announcements'),
    createAnnouncement: (data) => api.post('/faculty/announcements', data),
    getStats: () => api.get('/faculty/stats'),
    getStudents: () => api.get('/faculty/students'),
    getGradebook: (courseId) => api.get(`/faculty/courses/${courseId}/gradebook`)
};

// Admin API
const adminAPI = {
    getStudents: () => api.get('/admin/students'),
    updateStudent: (studentId, data) => api.put(`/admin/students/${studentId}`, data),
    deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
    getFaculty: () => api.get('/admin/faculty'),
    updateFaculty: (facultyId, data) => api.put(`/admin/faculty/${facultyId}`, data),
    deleteFaculty: (facultyId) => api.delete(`/admin/faculty/${facultyId}`),
    getCourses: () => api.get('/admin/courses'),
    deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
    assignFaculty: (courseId, data) => api.post(`/admin/courses/${courseId}/assign-faculty`, data),
    createEnrollment: (data) => api.post('/admin/enrollments', data),
    deleteEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}`),
    getAnalytics: () => api.get('/admin/analytics'),
    getAssignments: () => api.get('/admin/assignments'),
    getAnnouncements: () => api.get('/admin/announcements'),
    createAnnouncement: (data) => api.post('/admin/announcements', data),
    deleteAnnouncement: (announcementId) => api.delete(`/admin/announcements/${announcementId}`),
    getAttendance: () => api.get('/admin/attendance'),
    getResults: () => api.get('/admin/results'),
    getProfile: () => api.get('/admin/profile')
};
