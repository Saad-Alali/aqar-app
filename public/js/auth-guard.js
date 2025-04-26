/**
 * Authentication Guard for Aqar App
 * Handles protection of routes and redirection based on auth state
 */

document.addEventListener('DOMContentLoaded', function() {
    guardRoutes();
    updateAuthUI();
});

/**
 * Main function to guard routes based on auth state
 */
function guardRoutes() {
    const userData = localStorage.getItem('aqar_user');
    const isLoggedIn = !!userData;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Pages that require authentication
    const protectedPages = ['profile.html', 'favorites.html', 'edit-profile.html', 'change-password.html'];
    
    // Pages that should only be accessible when logged out
    const publicOnlyPages = ['login.html', 'register.html'];
    
    if (!isLoggedIn && protectedPages.includes(currentPage)) {
        showAuthOverlay();
    }
    
    if (isLoggedIn && publicOnlyPages.includes(currentPage)) {
        window.location.href = 'index.html';
    }
}

/**
 * Shows the authentication overlay for protected pages
 */
function showAuthOverlay() {
    const authOverlay = document.getElementById('authOverlay');
    const content = document.querySelector('.app-content');
    
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    
    if (content) {
        content.classList.add('blurred-content');
    }
}

/**
 * Updates UI elements based on authentication state
 */
function updateAuthUI() {
    const userData = localStorage.getItem('aqar_user');
    const isLoggedIn = !!userData;
    
    // Update login/logout buttons
    const loginButtons = document.querySelectorAll('.login-btn');
    const logoutButtons = document.querySelectorAll('.logout-btn');
    
    loginButtons.forEach(btn => {
        if (btn) btn.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    logoutButtons.forEach(btn => {
        if (btn) btn.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    // If user is logged in, update profile info wherever needed
    if (isLoggedIn) {
        try {
            const user = JSON.parse(userData);
            
            // Update profile name and email elements
            const profileNameElements = document.querySelectorAll('.user-name, #profileName');
            profileNameElements.forEach(el => {
                if (el) el.textContent = user.fullName || 'المستخدم';
            });
            
            const profileEmailElements = document.querySelectorAll('.user-email, #profileEmail');
            profileEmailElements.forEach(el => {
                if (el) el.textContent = user.email || '';
            });
            
            // Update profile avatar elements
            const profileAvatarElements = document.querySelectorAll('.user-avatar, #profileAvatar');
            profileAvatarElements.forEach(el => {
                if (el && user.avatarUrl) el.src = user.avatarUrl;
            });
            
            // Update favorite buttons
            updateFavoriteButtonsState(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

/**
 * Updates the state of favorite buttons based on user's favorites
 */
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

// Export functions for use in other modules
if (typeof module !== 'undefined') {
    module.exports = {
        guardRoutes,
        updateAuthUI,
        showAuthOverlay,
        updateFavoriteButtonsState
    };
}