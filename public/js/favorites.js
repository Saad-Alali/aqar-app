import { getCurrentUser, setCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  const favoritesPage = document.querySelector('.favorites-container');
  if (favoritesPage) {
    initFavoritesPage();
  } else {
    initFavoriteButtons();
  }
});

async function initFavoritesPage() {
  const user = getCurrentUser();
  if (!user) {
    redirectToLogin('يجب تسجيل الدخول لعرض المفضلة');
    return;
  }
  
  try {
    await loadFavorites();
    
    const favoriteTabs = document.querySelectorAll('.favorites-tab');
    favoriteTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        favoriteTabs.forEach(t => t.classList.remove('favorites-tab--active'));
        this.classList.add('favorites-tab--active');
        
        const category = this.textContent.trim();
        filterFavorites(category);
      });
    });
  } catch (error) {
    console.error("Error initializing favorites page:", error);
  }
}

function redirectToLogin(message) {
  // Store the message to display after redirect
  if (message) {
    localStorage.setItem('login_message', message);
  }
  
  // Redirect to login page
  window.location.href = 'login.html';
}

// Rest of the functions remain the same, but we'll update the favorite button click handler

function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
  
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const propertyId = this.dataset.propertyId;
      if (!propertyId) return;
      
      const user = getCurrentUser();
      if (!user) {
        // Show login modal instead of redirecting immediately
        showLoginModal('يجب تسجيل الدخول أولاً لإضافة العقار إلى المفضلة');
        return;
      }
      
      try {
        // Get current favorites
        const favorites = user.favorites || [];
        const heartIcon = this.querySelector('i');
        
        if (favorites.includes(propertyId)) {
          await removeFromFavorites(propertyId);
          
          if (heartIcon) {
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            heartIcon.style.color = '';
          }
          
          showToast('تمت إزالة العقار من المفضلة', 'info');
        } else {
          await addToFavorites(propertyId);
          
          if (heartIcon) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            heartIcon.style.color = '#ef4444';
          }
          
          showToast('تمت إضافة العقار إلى المفضلة', 'success');
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
      }
    });
  });
  
  updateFavoriteButtonsState();
}

// Add new function to show login modal
function showLoginModal(message) {
  // Remove any existing modal
  const existingModal = document.getElementById('loginModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.className = 'login-modal';
  
  // Create modal content
  modal.innerHTML = `
    <div class="login-modal__content">
      <div class="login-modal__header">
        <h3>تسجيل الدخول مطلوب</h3>
        <button class="login-modal__close">&times;</button>
      </div>
      <div class="login-modal__body">
        <p>${message || 'يرجى تسجيل الدخول للوصول إلى هذه الميزة'}</p>
      </div>
      <div class="login-modal__footer">
        <a href="login.html" class="btn btn--primary">تسجيل الدخول</a>
        <a href="register.html" class="btn btn--outline-primary">إنشاء حساب جديد</a>
      </div>
    </div>
  `;
  
  // Add modal styles if they don't exist
  if (!document.getElementById('loginModalStyles')) {
    const style = document.createElement('style');
    style.id = 'loginModalStyles';
    style.textContent = `
      .login-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .login-modal__content {
        background-color: #fff;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(20px);
        transition: transform 0.3s ease;
      }
      
      .login-modal__header {
        padding: 15px 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .login-modal__header h3 {
        margin: 0;
        font-size: 1.2rem;
      }
      
      .login-modal__close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
      }
      
      .login-modal__body {
        padding: 20px;
      }
      
      .login-modal__footer {
        padding: 15px 20px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .login-modal--visible {
        opacity: 1;
      }
      
      .login-modal--visible .login-modal__content {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add modal to the DOM
  document.body.appendChild(modal);
  
  // Add event listener to close button
  const closeBtn = modal.querySelector('.login-modal__close');
  closeBtn.addEventListener('click', () => {
    closeLoginModal(modal);
  });
  
  // Close when clicking on backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLoginModal(modal);
    }
  });
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('login-modal--visible');
  }, 10);
}

function closeLoginModal(modal) {
  modal.classList.remove('login-modal--visible');
  
  // Remove modal after animation completes
  setTimeout(() => {
    modal.remove();
  }, 300);
}

// The rest of your existing code remains the same
// ...

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

// Continue with the rest of your functions
async function addToFavorites(propertyId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const favorites = user.favorites || [];
    
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      
      user.favorites = favorites;
      setCurrentUser(user);
    }
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

async function removeFromFavorites(propertyId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const favorites = user.favorites || [];
    
    const updatedFavorites = favorites.filter(id => id !== propertyId);
    
    user.favorites = updatedFavorites;
    setCurrentUser(user);
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

export {
  addToFavorites,
  removeFromFavorites,
  showLoginModal
};