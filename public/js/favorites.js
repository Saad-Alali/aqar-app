import { getCurrentUser, setCurrentUser } from './auth.js';
import { showToast } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  initFavoriteButtons();
  
  const favoritesPage = document.querySelector('.favorites-container');
  if (favoritesPage) {
    initFavoritesPage();
  }
});

async function initFavoritesPage() {
  const user = getCurrentUser();
  
  if (!user) {
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

async function loadFavorites() {
  const user = getCurrentUser();
  if (!user) return;
  
  const favorites = user.favorites || [];
  const favoritesContainer = document.getElementById('favoritesWithItems');
  const emptyFavorites = document.getElementById('favoritesEmpty');
  
  if (!favoritesContainer || !emptyFavorites) return;
  
  if (favorites.length === 0) {
    favoritesContainer.style.display = 'none';
    emptyFavorites.style.display = 'block';
    return;
  }
  
  favoritesContainer.style.display = 'block';
  emptyFavorites.style.display = 'none';
}

function filterFavorites(category) {
  const favoritesWithItems = document.getElementById('favoritesWithItems');
  const emptyFavorites = document.getElementById('favoritesEmpty');
  
  if (category === 'شقق') {
    favoritesWithItems.style.display = 'none';
    emptyFavorites.style.display = 'block';
  } else {
    favoritesWithItems.style.display = 'block';
    emptyFavorites.style.display = 'none';
  }
}

function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
  
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const propertyId = this.dataset.propertyId;
      if (!propertyId) return;
      
      const user = getCurrentUser();
      if (!user) {
        showLoginModal('يجب تسجيل الدخول أولاً لإضافة العقار إلى المفضلة');
        return;
      }
      
      try {
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

function updateFavoriteButtonsState() {
  const user = getCurrentUser();
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

function showLoginModal(message) {
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

async function addToFavorites(propertyId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const favorites = user.favorites || [];
    
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      
      user.favorites = favorites;
      setCurrentUser(user);
      
      updateFavoriteButtonsState();
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
    let favorites = user.favorites || [];
    
    favorites = favorites.filter(id => id !== propertyId);
    
    user.favorites = favorites;
    setCurrentUser(user);
    
    updateFavoriteButtonsState();
    
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