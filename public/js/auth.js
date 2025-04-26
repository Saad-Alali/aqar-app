import { updateAuthUI } from './auth-utilities.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginForm(loginForm);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initRegisterForm(registerForm);
    }
    
    checkAuthState();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                await logoutUser();
            }
        });
    }
});

function checkAuthState() {
    const user = getCurrentUser();
    if (user) {
        if (isOnLoginPage() || isOnRegisterPage()) {
            window.location.href = 'index.html';
            return;
        }
    } else {
        const protectedPages = ['profile.html', 'favorites.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
    
    updateAuthUI();
}

function isOnLoginPage() {
    return window.location.pathname.includes('login.html');
}

function isOnRegisterPage() {
    return window.location.pathname.includes('register.html');
}

function initLoginForm(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        if (!email || !password) {
            showMessage('formAlerts', 'Please enter email and password', 'danger');
            return;
        }
        
        try {
            const user = {
                id: 'user123',
                fullName: 'Demo User',
                email: email,
                avatarUrl: 'img/placeholder.jpg'
            };
            
            setCurrentUser(user);
            
            showMessage('formAlerts', 'Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showMessage('formAlerts', 'Login failed. Please check your credentials.', 'danger');
        }
    });
}

function initRegisterForm(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = form.querySelector('#fullName').value;
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        
        if (!fullName || !email || !password) {
            showMessage('formAlerts', 'Please fill all required fields', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('formAlerts', 'Passwords do not match', 'danger');
            return;
        }
        
        try {
            const user = {
                id: 'user' + Date.now(),
                fullName: fullName,
                email: email,
                avatarUrl: 'img/placeholder.jpg'
            };
            
            setCurrentUser(user);
            
            showMessage('formAlerts', 'Registration successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showMessage('formAlerts', 'Registration failed. Please try again.', 'danger');
        }
    });
}

function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="alert alert--${type}">${message}</div>`;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

async function logoutUser() {
    try {
        localStorage.removeItem('aqar_user');
        
        window.location.href = 'login.html';
        return true;
    } catch (error) {
        console.error("Error signing out:", error);
        return false;
    }
}

function getCurrentUser() {
    try {
        const userData = localStorage.getItem('aqar_user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}

function setCurrentUser(userData) {
    try {
        localStorage.setItem('aqar_user', JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error("Error setting current user:", error);
        return false;
    }
}

if (window.Aqar && window.Aqar.Auth) {
    window.Aqar.Auth = {
        ...window.Aqar.Auth,
        isLoggedIn: () => !!getCurrentUser(),
        getCurrentUser,
        setCurrentUser,
        logout: logoutUser,
        requireAuth: (redirectUrl = 'login.html') => {
            if (!getCurrentUser()) {
                window.location.href = redirectUrl;
            }
        },
        redirectIfAuth: (redirectUrl = 'index.html') => {
            if (getCurrentUser()) {
                window.location.href = redirectUrl;
            }
        },
        getCurrentUserId: () => {
            const user = getCurrentUser();
            return user ? user.id : null;
        }
    };
}

export {
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    updateAuthUI
};