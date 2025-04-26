document.addEventListener('DOMContentLoaded', function() {
  initLanguageSwitcher();
  
  const currentLang = detectPreferredLanguage();
  applyLanguage(currentLang);
});

function initLanguageSwitcher() {
  const switcherButton = document.getElementById('languageSwitcher');
  const languageDropdown = document.getElementById('languageDropdown');
  const languageOptions = document.querySelectorAll('.language-switcher__option');
  const currentLangSpan = document.querySelector('.language-switcher__current');
  
  if (!switcherButton || !languageDropdown) return;
  
  const currentLang = detectPreferredLanguage();
  updateActiveLanguage(currentLang);
  
  switcherButton.addEventListener('click', function(e) {
      e.preventDefault();
      const isVisible = languageDropdown.style.display === 'block';
      languageDropdown.style.display = isVisible ? 'none' : 'block';
  });
  
  languageOptions.forEach(option => {
      option.addEventListener('click', function(e) {
          e.preventDefault();
          
          const lang = this.getAttribute('data-lang');
          
          applyLanguage(lang);
          
          if (currentLangSpan) {
              currentLangSpan.textContent = lang === 'ar' ? 'العربية' : 'English';
          }
          
          languageDropdown.style.display = 'none';
          
          showToast(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English', 'success');
      });
  });
  
  document.addEventListener('click', function(e) {
      if (!switcherButton.contains(e.target) && !languageDropdown.contains(e.target)) {
          languageDropdown.style.display = 'none';
      }
  });
}

function applyLanguage(lang) {
  localStorage.setItem('aqar_language', lang);
  
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  document.body.style.fontFamily = lang === 'ar' ? "'Tajawal', sans-serif" : "'Poppins', sans-serif";
  
  updateTextElements(lang);
  
  updateActiveLanguage(lang);
  
  updateDirectionalStyles(lang);
}

function updateActiveLanguage(lang) {
  const options = document.querySelectorAll('.language-switcher__option');
  const currentLangSpan = document.querySelector('.language-switcher__current');
  
  options.forEach(option => {
      option.classList.remove('language-switcher__option--active');
      
      if (option.getAttribute('data-lang') === lang) {
          option.classList.add('language-switcher__option--active');
          
          if (currentLangSpan) {
              currentLangSpan.textContent = lang === 'ar' ? 'العربية' : 'English';
          }
      }
  });
}

function updateTextElements(lang) {
  const translations = {
      'appTitle': {
          'ar': 'عقار',
          'en': 'Aqar'
      },
      'home': {
          'ar': 'الرئيسية',
          'en': 'Home'
      },
      'search': {
          'ar': 'بحث',
          'en': 'Search'
      },
      'favorites': {
          'ar': 'المفضلة',
          'en': 'Favorites'
      },
      'map': {
          'ar': 'الخريطة',
          'en': 'Map'
      },
      'profile': {
          'ar': 'حسابي',
          'en': 'Profile'
      },
      'personalInfo': {
          'ar': 'المعلومات الشخصية',
          'en': 'Personal Information'
      },
      'myProperties': {
          'ar': 'عقاراتي',
          'en': 'My Properties'
      },
      'notifications': {
          'ar': 'الإشعارات',
          'en': 'Notifications'
      },
      'changePassword': {
          'ar': 'تغيير كلمة المرور',
          'en': 'Change Password'
      },
      'contactUs': {
          'ar': 'اتصل بنا',
          'en': 'Contact Us'
      },
      'logout': {
          'ar': 'تسجيل الخروج',
          'en': 'Logout'
      },
      'loginRequired': {
          'ar': 'تسجيل الدخول مطلوب',
          'en': 'Login Required'
      },
      'loginToViewProfile': {
          'ar': 'يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى صفحة الملف الشخصي',
          'en': 'Log in or create an account to access your profile page'
      },
      'loginToFavorites': {
          'ar': 'يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى قائمة المفضلة الخاصة بك',
          'en': 'Log in or create an account to access your favorites'
      },
      'login': {
          'ar': 'تسجيل الدخول',
          'en': 'Login'
      },
      'createAccount': {
          'ar': 'إنشاء حساب جديد',
          'en': 'Create New Account'
      },
      'appVersion': {
          'ar': 'نسخة التطبيق: 1.0.0',
          'en': 'App Version: 1.0.0'
      },
      'copyright': {
          'ar': '© 2025 عقار - جميع الحقوق محفوظة',
          'en': '© 2025 Aqar - All Rights Reserved'
      }
  };
  
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key] && translations[key][lang]) {
          element.textContent = translations[key][lang];
      }
  });
  
  const appTitle = document.querySelector('.app-title');
  if (appTitle) {
      appTitle.textContent = lang === 'ar' ? 'حسابي' : 'My Profile';
  }
  
  const homeTab = document.querySelector('.tab-bar__item:nth-child(1) .tab-bar__label');
  const searchTab = document.querySelector('.tab-bar__item:nth-child(2) .tab-bar__label');
  const favoritesTab = document.querySelector('.tab-bar__item:nth-child(3) .tab-bar__label');
  const mapTab = document.querySelector('.tab-bar__item:nth-child(4) .tab-bar__label');
  const profileTab = document.querySelector('.tab-bar__item:nth-child(5) .tab-bar__label');
  
  if (homeTab) homeTab.textContent = translations.home[lang];
  if (searchTab) searchTab.textContent = translations.search[lang];
  if (favoritesTab) favoritesTab.textContent = translations.favorites[lang];
  if (mapTab) mapTab.textContent = translations.map[lang];
  if (profileTab) profileTab.textContent = translations.profile[lang];
  
  document.title = lang === 'ar' ? 'حسابي - عقار' : 'My Profile - Aqar';
}

function updateDirectionalStyles(lang) {
  const isRTL = lang === 'ar';
  
  let styleElement = document.getElementById('direction-styles');
  if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'direction-styles';
      document.head.appendChild(styleElement);
  }
  
  if (isRTL) {
      styleElement.textContent = `
          .profile-menu-icon { margin-left: var(--spacing-md); margin-right: 0; }
          .profile-menu-arrow { transform: rotate(0); }
          .back-button i { transform: rotate(0); }
      `;
  } else {
      styleElement.textContent = `
          .profile-menu-icon { margin-right: var(--spacing-md); margin-left: 0; }
          .profile-menu-arrow { transform: rotate(180deg); }
          .back-button i { transform: rotate(180deg); }
          .app-header-action:first-child { text-align: left; }
          .app-header-action:last-child { text-align: right; }
      `;
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

function detectPreferredLanguage() {
  const savedLanguage = localStorage.getItem('aqar_language');
  if (savedLanguage) {
      return savedLanguage;
  }
  
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('ar') ? 'ar' : 'en';
}

export {
  detectPreferredLanguage,
  applyLanguage,
  updateTextElements,
  showToast
};