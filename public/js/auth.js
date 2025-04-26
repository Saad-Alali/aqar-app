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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const protectedPages = ['profile.html', 'favorites.html', 'edit-profile.html', 
                           'change-password.html', 'my-properties.html'];
                           
    const publicOnlyPages = ['login.html', 'register.html'];
    
    if (user) {
        if (publicOnlyPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return;
        }
    } else {
        if (protectedPages.includes(currentPage)) {
            const authOverlay = document.getElementById('authOverlay');
            if (authOverlay) {
                authOverlay.style.display = 'flex';
                
                const mainContent = document.querySelector('.app-content');
                if (mainContent) {
                    mainContent.style.filter = 'blur(5px)';
                    mainContent.style.pointerEvents = 'none';
                }
            } else {
                window.location.href = 'login.html';
            }
        }
    }
    
    updateAuthUI();
}

function initLoginForm(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        
        if (!email || !password) {
            showMessage('formAlerts', 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 'danger');
            return;
        }
        
        try {
            const user = {
                id: 'user123',
                fullName: 'مستخدم تجريبي',
                email: email,
                avatarUrl: 'img/placeholder.jpg',
                favorites: []
            };
            
            setCurrentUser(user);
            
            showMessage('formAlerts', 'تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showMessage('formAlerts', 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.', 'danger');
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
            showMessage('formAlerts', 'يرجى ملء جميع الحقول المطلوبة', 'danger');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('formAlerts', 'كلمات المرور غير متطابقة', 'danger');
            return;
        }
        
        try {
            const user = {
                id: 'user' + Date.now(),
                fullName: fullName,
                email: email,
                avatarUrl: 'img/placeholder.jpg',
                favorites: []
            };
            
            setCurrentUser(user);
            
            showMessage('formAlerts', 'تم التسجيل بنجاح! جاري التحويل...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            showMessage('formAlerts', 'فشل التسجيل. يرجى المحاولة مرة أخرى.', 'danger');
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

function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast--visible');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
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
    updateAuthUI,
    showToast
};