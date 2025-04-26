document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
});

function checkAuthState() {
    const userData = localStorage.getItem('aqar_user');
    const isLoggedIn = !!userData;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const protectedPages = ['profile.html', 'favorites.html', 'edit-profile.html', 
                           'change-password.html', 'my-properties.html'];
                           
    const publicOnlyPages = ['login.html', 'register.html'];
    
    if (isLoggedIn) {
        if (publicOnlyPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return;
        }
        
        updateLoggedInUI();
    } else {
        if (protectedPages.includes(currentPage)) {
            showAuthOverlay();
        }
        
        updateLoggedOutUI();
    }
}

function showAuthOverlay() {
    const authOverlay = document.getElementById('authOverlay');
    const mainContent = document.querySelector('.app-content');
    
    if (authOverlay) {
        authOverlay.style.display = 'flex';
        
        if (mainContent) {
            mainContent.style.filter = 'blur(5px)';
            mainContent.style.pointerEvents = 'none';
        }
    }
}

function updateLoggedInUI() {
    try {
        const userData = localStorage.getItem('aqar_user');
        const user = JSON.parse(userData);
        
        const userNameElements = document.querySelectorAll('.user-name, #profileName');
        userNameElements.forEach(el => {
            if (el) el.textContent = user.fullName || 'User';
        });
        
        const userEmailElements = document.querySelectorAll('.user-email, #profileEmail');
        userEmailElements.forEach(el => {
            if (el) el.textContent = user.email || '';
        });
        
        const userAvatarElements = document.querySelectorAll('.user-avatar, #profileAvatar');
        userAvatarElements.forEach(el => {
            if (el) el.src = user.avatarUrl || 'img/placeholder.jpg';
        });
        
        const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
        loginButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        const profileButtons = document.querySelectorAll('.profile-btn, .logout-btn');
        profileButtons.forEach(btn => {
            if (btn) btn.style.display = 'block';
        });
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