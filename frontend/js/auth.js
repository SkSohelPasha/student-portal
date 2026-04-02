// Authentication Functions

function toggleRoleFields(role) {
    document.getElementById('studentFields').style.display = role === 'student' ? 'block' : 'none';
    document.getElementById('facultyFields').style.display = role === 'faculty' ? 'block' : 'none';
}

async function checkAdminCount() {
    try {
        const { count } = await authAPI.getAdminCount();
        const adminOption = document.querySelector('select[name="role"] option[value="admin"]');
        if (adminOption) {
            if (count >= 3) {
                adminOption.style.display = 'none';
                // If the selected value was admin, reset it
                const select = adminOption.parentElement;
                if (select.value === 'admin') {
                    select.value = '';
                    toggleRoleFields('');
                }
            } else {
                adminOption.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Failed to fetch admin count:', error);
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', checkAdminCount);
// Also call when switching to register tab
document.addEventListener('shown.bs.tab', function (event) {
    if (event.target.getAttribute('href') === '#registerTab') {
        checkAdminCount();
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await authAPI.login(credentials);
        
        // Store token and user data
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showToast('Login successful!', 'success');
        
        // Re-check admin count if Pasha logged in (since he removes other admins)
        if (response.user.username === 'Pasha') {
            await checkAdminCount();
        }

        // Redirect to dashboard
        showDashboard();
    } catch (error) {
        showToast(error.message || 'Login failed', 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        department: formData.get('department'),
        year: formData.get('year') ? parseInt(formData.get('year')) : undefined,
        semester: formData.get('semester') ? parseInt(formData.get('semester')) : undefined,
        designation: formData.get('designation')
    };
    
    // Remove undefined values
    Object.keys(userData).forEach(key => 
        userData[key] === undefined && delete userData[key]
    );
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
        
        await authAPI.register(userData);
        showToast('Registration successful! Please login.', 'success');
        
        // Re-check admin count
        await checkAdminCount();
        
        // Reset form and switch to login tab
        form.reset();
        const loginTab = new bootstrap.Tab(document.querySelector('[href="#loginTab"]'));
        loginTab.show();
    } catch (error) {
        showToast(error.message || 'Registration failed', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear notification interval
    if (window.notificationInterval) {
        clearInterval(window.notificationInterval);
        window.notificationInterval = null;
    }
    
    // Hide dashboard and show login
    document.getElementById('dashboardWrapper').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    
    showToast('Logged out successfully', 'info');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}
