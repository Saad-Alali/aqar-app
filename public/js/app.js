// public/js/app.js
import { initializeFirebase } from './firebase.js';
import { getCurrentUser } from './auth-service.js';

const MAX_RETRIES = 3;
let initRetries = 0;
let isInitializing = false;
let isInitialized = false;

let isOfflineMode = false;

document.addEventListener('DOMContentLoaded', async function() {
  await initApp();
});

function detectAdBlocker() {
  return new Promise(resolve => {
    const testElement = document.createElement('div');
    testElement.className = 'adsbox';
    testElement.innerHTML = '&nbsp;';
    document.body.appendChild(testElement);
    
    setTimeout(() => {
      const isBlocked = testElement.offsetHeight === 0;
      document.body.removeChild(testElement);
      
      if (isBlocked) {
        showAdBlockerWarning();
      }
      
      resolve(isBlocked);
    }, 100);
  });
}

function showAdBlockerWarning() {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #FFECA9;
    color: #734900;
    text-align: center;
    padding: 10px;
    font-size: 14px;
    z-index: 9998;
    border-top: 1px solid #E2D7AA;
  `;
  warning.innerHTML = `
    <p>تم اكتشاف مانع إعلانات. قد يؤثر هذا على بعض وظائف التطبيق. يعمل الموقع حاليًا في وضع عدم الاتصال.</p>
    <button style="background: #FFC107; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 4px; cursor: pointer;">تجاهل</button>
  `;
  
  document.body.appendChild(warning);
  
  warning.querySelector('button').addEventListener('click', function() {
    warning.remove();
  });
}

async function initApp() {
  if (isInitializing) return;
  if (isInitialized) return;
  
  isInitializing = true;
  
  try {
    // Check if we're online first
    const isOnline = navigator.onLine;
    if (!isOnline) {
      console.log("Device is offline, entering offline mode");
      enterOfflineMode();
      updateAuthUI(await getCurrentUser()); // This will use localStorage
      isInitialized = true;
      isInitializing = false;
      return;
    }
    
    await detectAdBlocker();
    
    // Try to initialize Firebase
    try {
      await initializeFirebaseWithRetry();
    } catch (firebaseError) {
      console.error("Failed to initialize Firebase after retries:", firebaseError);
      // Continue with offline mode
      enterOfflineMode();
    }
    
    const user = await getCurrentUser();
    updateAuthUI(user);
    
    initNavigation();
    initSwipeActions();
    initPullToRefresh();
    
    setupOfflineDetection();
    
    isInitialized = true;
    console.log("App initialized successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
    
    if (initRetries < MAX_RETRIES) {
      initRetries++;
      const delay = Math.pow(2, initRetries) * 1000;
      
      console.log(`Retrying initialization (${initRetries}/${MAX_RETRIES}) in ${delay}ms...`);
      setTimeout(initApp, delay);
    } else {
      showToast("حدث خطأ في تهيئة التطبيق، سيتم العمل في وضع عدم الاتصال", "error");
      
      enterOfflineMode();
      updateAuthUI(await getCurrentUser()); // This will use localStorage
      isInitialized = true;
    }
  } finally {
    isInitializing = false;
  }
}

async function initializeFirebaseWithRetry() {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      await initializeFirebase();
      return;
    } catch (error) {
      console.error(`Firebase initialization attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('nav__menu--active');
    });
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        try {
          await logoutUser();
          window.location.href = 'login.html';
        } catch (error) {
          console.error("Error logging out:", error);
          showToast("حدث خطأ في تسجيل الخروج", "error");
        }
      }
    });
  }
  
  const searchToggle = document.getElementById('searchToggle');
  const searchPanel = document.getElementById('searchPanel');
  
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      const isHidden = searchPanel.style.display === 'none' || !searchPanel.style.display;
      searchPanel.style.display = isHidden ? 'block' : 'none';
    });
  }
  
  const filterBtn = document.getElementById('filterBtn');
  
  if (filterBtn) {
    filterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchPanel) {
        const isHidden = searchPanel.style.display === 'none' || !searchPanel.style.display;
        searchPanel.style.display = isHidden ? 'block' : 'none';
      }
    });
  }
}

function initSwipeActions() {
  const swipeItems = document.querySelectorAll('.swipe-item');
  
  swipeItems.forEach(item => {
    let startX, moveX, deltaX = 0;
    let isSwiping = false;
    
    item.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      
      item.style.transition = 'none';
    });
    
    item.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      
      moveX = e.touches[0].clientX;
      deltaX = moveX - startX;
      
      if (deltaX < 0 && deltaX > -150) {
        item.style.transform = `translateX(${deltaX}px)`;
      }
    });
    
    item.addEventListener('touchend', () => {
      isSwiping = false;
      item.style.transition = 'transform 0.3s ease';
      
      if (deltaX < -50) {
        item.style.transform = 'translateX(-80px)';
      } else {
        item.style.transform = 'translateX(0)';
      }
      
      deltaX = 0;
    });
    
    item.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      isSwiping = true;
      
      item.style.transition = 'none';
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isSwiping) return;
      
      moveX = e.clientX;
      deltaX = moveX - startX;
      
      if (deltaX < 0 && deltaX > -150) {
        item.style.transform = `translateX(${deltaX}px)`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (!isSwiping) return;
      
      isSwiping = false;
      item.style.transition = 'transform 0.3s ease';
      
      if (deltaX < -50) {
        item.style.transform = 'translateX(-80px)';
      } else {
        item.style.transform = 'translateX(0)';
      }
      
      deltaX = 0;
    });
  });
}

function initPullToRefresh() {
  const pullIndicator = document.getElementById('pullIndicator');
  const appContent = document.querySelector('.app-content');
  
  if (!pullIndicator || !appContent) return;
  
  let startY, moveY, deltaY = 0;
  let isPulling = false;
  let threshold = 80;
  
  appContent.addEventListener('touchstart', (e) => {
    if (appContent.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  });
  
  appContent.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    
    moveY = e.touches[0].clientY;
    deltaY = moveY - startY;
    
    if (deltaY > 0) {
      pullIndicator.style.display = 'flex';
      
      const resistance = deltaY * 0.4;
      
      if (resistance < threshold) {
        appContent.style.transform = `translateY(${resistance}px)`;
      }
      
      e.preventDefault();
    }
  });
  
  appContent.addEventListener('touchend', () => {
    if (!isPulling) return;
    
    isPulling = false;
    appContent.style.transition = 'transform 0.3s ease';
    
    if (deltaY > threshold / 2) {
      pullIndicator.innerHTML = '<div class="pull-indicator__spinner"></div><span>جاري التحديث...</span>';
      
      setTimeout(() => {
        appContent.style.transform = 'translateY(0)';
        pullIndicator.style.display = 'none';
        
        if (navigator.onLine) {
          // Try to reinitialize Firebase before reloading
          if (!window.firebaseApp) {
            initializeFirebase()
              .then(() => {
                location.reload();
              })
              .catch(() => {
                showToast("فشل الاتصال بالخدمة، جاري التحديث محلياً", "warning");
                // Perform a local refresh without full page reload
                refreshLocalContent();
              });
          } else {
            location.reload();
          }
        } else {
          showToast("لا يمكن التحديث، أنت غير متصل بالإنترنت", "error");
        }
      }, 1500);
    } else {
      appContent.style.transform = 'translateY(0)';
      pullIndicator.style.display = 'none';
    }
    
    deltaY = 0;
  });
}

function refreshLocalContent() {
  // A function to refresh content without reloading the page
  // This would update UI based on local storage data
  
  // Refresh user info
  getCurrentUser().then(user => {
    updateAuthUI(user);
  });
  
  // Other local content refreshes would go here
}

function setupOfflineDetection() {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  if (!navigator.onLine) {
    enterOfflineMode();
  }
}

function handleOnline() {
  if (isOfflineMode) {
    isOfflineMode = false;
    showToast("تم استعادة الاتصال بالإنترنت", "success");
    
    if (!window.firebaseApp) {
      initializeFirebase()
        .then(() => {
          console.log("Firebase reinitialized successfully after reconnection");
          
          // Try to sync any offline changes
          syncOfflineChanges();
        })
        .catch(error => {
          console.error("Failed to reinitialize Firebase after reconnection:", error);
        });
    } else {
      // Try to sync any offline changes
      syncOfflineChanges();
    }
    
    removeOfflineIndicator();
  }
}

function syncOfflineChanges() {
  // This function would sync any changes made while offline
  // For now, just a placeholder
  console.log("Syncing offline changes...");
}

function handleOffline() {
  enterOfflineMode();
}

function enterOfflineMode() {
  isOfflineMode = true;
  showToast("أنت غير متصل بالإنترنت، سيتم العمل في وضع عدم الاتصال", "warning", 5000);
  
  addOfflineIndicator();
}

function addOfflineIndicator() {
  removeOfflineIndicator();
  
  const indicator = document.createElement('div');
  indicator.id = 'offlineIndicator';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #f59e0b;
    color: white;
    text-align: center;
    padding: 4px 8px;
    font-size: 0.8rem;
    z-index: 9999;
  `;
  indicator.textContent = "أنت غير متصل بالإنترنت";
  
  document.body.appendChild(indicator);
  
  const appContent = document.querySelector('.app-content');
  if (appContent) {
    appContent.style.paddingTop = '28px';
  }
}

function removeOfflineIndicator() {
  const indicator = document.getElementById('offlineIndicator');
  if (indicator) {
    indicator.remove();
    
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.style.paddingTop = '';
    }
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

function updateAuthUI(user) {
  if (user) {
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
    
    // Add offline indicator if it's an offline user
    if (user.isOfflineUser) {
      const offlineUserIndicators = document.querySelectorAll('.user-name, #profileName');
      offlineUserIndicators.forEach(el => {
        // Add a small offline indicator next to the name
        const indicator = document.createElement('small');
        indicator.style.cssText = `
          font-size: 0.7rem;
          color: #f59e0b;
          margin-right: 5px;
          vertical-align: middle;
        `;
        indicator.textContent = " (وضع عدم الاتصال)";
        
        // Only add if it doesn't already exist
        if (!el.querySelector('small')) {
          el.appendChild(indicator);
        }
      });
    }
  } else {
    const loginButtons = document.querySelectorAll('.login-btn, .register-btn');
    loginButtons.forEach(btn => {
      if (btn) btn.style.display = 'block';
    });
    
    const profileButtons = document.querySelectorAll('.profile-btn, .logout-btn');
    profileButtons.forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
    
    checkAuthProtection();
  }
}

function checkAuthProtection() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  const protectedPages = ['profile.html', 'favorites.html', 'edit-profile.html', 'change-password.html'];
  
  if (protectedPages.includes(currentPage)) {
    const authOverlay = document.getElementById('authOverlay');
    const content = document.querySelector('.app-content');
    
    if (authOverlay) {
      authOverlay.style.display = 'flex';
    }
    
    if (content) {
      content.classList.add('blurred-content');
    }
  }
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

window.showToast = showToast;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;

export { showToast, showLoginModal, closeLoginModal, updateAuthUI };