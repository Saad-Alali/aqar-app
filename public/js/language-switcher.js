// language-switcher.js - Simplified for better performance
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSwitcher();
    
    const currentLang = detectPreferredLanguage();
    applyLanguage(currentLang);
  });
  
  /**
   * Initialize the language switcher UI elements
   */
  function initLanguageSwitcher() {
    const switcherButton = document.getElementById('languageSwitcher');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageOptions = document.querySelectorAll('.language-switcher__option');
    const currentLangSpan = document.querySelector('.language-switcher__current');
    
    if (!switcherButton || !languageDropdown) return;
    
    const currentLang = detectPreferredLanguage();
    updateActiveLanguage(currentLang);
    
    // Toggle dropdown on button click
    switcherButton.addEventListener('click', function(e) {
      e.preventDefault();
      const isVisible = languageDropdown.style.display === 'block';
      languageDropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Handle language option selection
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
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!switcherButton.contains(e.target) && !languageDropdown.contains(e.target)) {
        languageDropdown.style.display = 'none';
      }
    });
  }
  
  /**
   * Apply the selected language to the UI
   * @param {string} lang - The language code ('ar' or 'en')
   */
  function applyLanguage(lang) {
    localStorage.setItem('aqar_language', lang);
    
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.body.style.fontFamily = lang === 'ar' ? "'Tajawal', sans-serif" : "'Poppins', sans-serif";
    
    // Only update key UI elements that need translation
    updateCriticalElements(lang);
    
    updateActiveLanguage(lang);
    
    updateDirectionalStyles(lang);
  }
  
  /**
   * Update the active language in the language switcher UI
   * @param {string} lang - The language code ('ar' or 'en')
   */
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
  
  /**
   * Update only the critical UI elements for language change to improve performance
   * @param {string} lang - The language code ('ar' or 'en')
   */
  function updateCriticalElements(lang) {
    // Only translate elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    // Common translations
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
      'logout': {
        'ar': 'تسجيل الخروج',
        'en': 'Logout'
      },
      'loginRequired': {
        'ar': 'تسجيل الدخول مطلوب',
        'en': 'Login Required'
      },
      'login': {
        'ar': 'تسجيل الدخول',
        'en': 'Login'
      },
      'createAccount': {
        'ar': 'إنشاء حساب جديد',
        'en': 'Create New Account'
      }
    };
    
    // Update only marked elements
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key] && translations[key][lang]) {
        element.textContent = translations[key][lang];
      }
    });
    
    // Update tab bar (always present in most pages)
    updateTabBar(lang);
    
    // Update page title
    updatePageTitle(lang);
  }
  
  /**
   * Update the tab bar navigation items
   * @param {string} lang - The language code ('ar' or 'en')
   */
  function updateTabBar(lang) {
    const homeTab = document.querySelector('.tab-bar__item:nth-child(1) .tab-bar__label');
    const searchTab = document.querySelector('.tab-bar__item:nth-child(2) .tab-bar__label');
    const favoritesTab = document.querySelector('.tab-bar__item:nth-child(3) .tab-bar__label');
    const profileTab = document.querySelector('.tab-bar__item:nth-child(5) .tab-bar__label');
    
    if (homeTab) homeTab.textContent = lang === 'ar' ? 'الرئيسية' : 'Home';
    if (searchTab) searchTab.textContent = lang === 'ar' ? 'بحث' : 'Search';
    if (favoritesTab) favoritesTab.textContent = lang === 'ar' ? 'المفضلة' : 'Favorites';
    if (profileTab) profileTab.textContent = lang === 'ar' ? 'حسابي' : 'Profile';
  }
  
  /**
   * Update the page title based on the current page
   * @param {string} lang - The language code ('ar' or 'en')
   */
  function updatePageTitle(lang) {
    const pagePath = window.location.pathname;
    const pageName = pagePath.split('/').pop();
    
    // Set base title
    let title = lang === 'ar' ? 'عقار' : 'Aqar';
    
    // Add page-specific title based on page
    if (pageName.includes('profile')) {
      title = (lang === 'ar' ? 'حسابي - ' : 'Profile - ') + title;
    } else if (pageName.includes('search')) {
      title = (lang === 'ar' ? 'بحث - ' : 'Search - ') + title;
    } else if (pageName.includes('favorites')) {
      title = (lang === 'ar' ? 'المفضلة - ' : 'Favorites - ') + title;
    } else if (pageName.includes('login')) {
      title = (lang === 'ar' ? 'تسجيل الدخول - ' : 'Login - ') + title;
    } else if (pageName.includes('register')) {
      title = (lang === 'ar' ? 'تسجيل - ' : 'Register - ') + title;
    } else if (pageName.includes('property-details')) {
      title = (lang === 'ar' ? 'تفاصيل العقار - ' : 'Property Details - ') + title;
    }
    
    document.title = title;
  }
  
  /**
   * Update the CSS for RTL/LTR layouts
   * @param {string} lang - The language code ('ar' or 'en')
   */
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
  
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The toast type ('info', 'success', 'error')
   * @param {number} duration - How long to show the toast in ms
   */
  function showToast(message, type = 'info', duration = 3000) {
    // First check if the global showToast function is available
    if (window.showToast) {
      window.showToast(message, type, duration);
      return;
    }
    
    // Otherwise implement our own toast
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
  
  /**
   * Detect the preferred language from browser or localStorage
   * @returns {string} The language code ('ar' or 'en')
   */
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
    updateCriticalElements,
    showToast
  };