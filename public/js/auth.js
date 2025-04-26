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
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                logoutUser();
                window.location.href = 'login.html';
            }
        });
    }
});

function checkAuthState() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const protectedPages = ['profile.html', 'favorites.html', 'edit-profile.html', 
                          'change-password.html'];
                           
    const publicOnlyPages = ['login.html', 'register.html'];
    
    if (user) {
        if (publicOnlyPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return;
        }
        
        updateLoggedInUI(user);
    } else {
        if (protectedPages.includes(currentPage)) {
            const authOverlay = document.getElementById('authOverlay');
            if (authOverlay) {
                authOverlay.style.display = 'flex';
                
                const mainContent = document.querySelector('.app-content');
                if (mainContent) {
                    mainContent.classList.add('blurred-content');
                }
            } else {
                window.location.href = 'login.html';
            }
        }
        
        updateLoggedOutUI();
    }
}

function updateLoggedInUI(user) {
    try {
        const profileNameElements = document.querySelectorAll('.user-name, #profileName');
        profileNameElements.forEach(el => {
            if (el) el.textContent = user.fullName || 'المستخدم';
        });
        
        const profileEmailElements = document.querySelectorAll('.user-email, #profileEmail');
        profileEmailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });
        
        const profileAvatarElements = document.querySelectorAll('.user-avatar, #profileAvatar');
        profileAvatarElements.forEach(el => {
            if (el && user.avatarUrl) el.src = user.avatarUrl;
        });
        
        const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
        loginButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        const profileButtons = document.querySelectorAll('.profile-btn, .logout-btn');
        profileButtons.forEach(btn => {
            if (btn) btn.style.display = 'block';
        });
        
        updateFavoriteButtonsState(user);
    } catch (error) {
        console.error("Error updating logged in UI:", error);
    }
}

function updateLoggedOutUI() {
    const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
    loginButtons.forEach(btn => {
        if (btn) btn.style.display = 'block';
    });
    
    const profileButtons = document.querySelectorAll('.profile-btn, .logout-btn');
    profileButtons.forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
}

function initLoginForm(form) {
    form.addEventListener('submit', function(e) {
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
    form.addEventListener('submit', function(e) {
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

function logoutUser() {
    try {
        localStorage.removeItem('aqar_user');
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

function updateFavoriteButtonsState(user) {
    if (!user) return;
    
    const favorites = user.favorites || [];
    const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
    
    favoriteButtons.forEach(btn => {
        const propertyId = btn.dataset.propertyId;
        if (!propertyId) return;
        
        const heartIcon = btn.querySelector('i');
        if (!heartIcon) return;
        
        if (favorites.includes(propertyId)) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = '#ef4444';
        } else {
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            heartIcon.style.color = '';
        }
    });
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

function addToFavorites(propertyId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    try {
        const favorites = user.favorites || [];
        
        if (!favorites.includes(propertyId)) {
            favorites.push(propertyId);
            
            user.favorites = favorites;
            setCurrentUser(user);
            
            updateFavoriteButtonsState(user);
        }
        
        return true;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        return false;
    }
}

function removeFromFavorites(propertyId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    try {
        let favorites = user.favorites || [];
        
        favorites = favorites.filter(id => id !== propertyId);
        
        user.favorites = favorites;
        setCurrentUser(user);
        
        updateFavoriteButtonsState(user);
        
        return true;
    } catch (error) {
        console.error("Error removing from favorites:", error);
        return false;
    }
}

function toggleFavorite(propertyId) {
    const user = getCurrentUser();
    if (!user) {
        showLoginModal('يجب تسجيل الدخول أولاً لإضافة العقار إلى المفضلة');
        return false;
    }
    
    const favorites = user.favorites || [];
    
    if (favorites.includes(propertyId)) {
        removeFromFavorites(propertyId);
        showToast('تمت إزالة العقار من المفضلة', 'info');
        return false;
    } else {
        addToFavorites(propertyId);
        showToast('تمت إضافة العقار إلى المفضلة', 'success');
        return true;
    }
}

function showLoginModal(message) {
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'auth-overlay';
    modal.id = 'loginModal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="auth-overlay__icon">
            <i class="fas fa-heart"></i>
        </div>
        <h2 class="auth-overlay__title">تسجيل الدخول مطلوب</h2>
        <p class="auth-overlay__description">
            ${message || 'يجب تسجيل الدخول أو إنشاء حساب جديد لإضافة العقارات إلى المفضلة.'}
        </p>
        <div class="auth-overlay__buttons">
            <a href="login.html" class="btn btn--primary">تسجيل الدخول</a>
            <a href="register.html" class="btn btn--outline-primary">إنشاء حساب جديد</a>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLoginModal();
        }
    });
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.remove();
    }
}

window.Aqar = window.Aqar || {};
window.Aqar.Auth = {
    isLoggedIn: () => !!getCurrentUser(),
    getCurrentUser,
    setCurrentUser,
    logout: logoutUser,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    showLoginModal,
    showToast
};

export {
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    showLoginModal,
    showToast
};