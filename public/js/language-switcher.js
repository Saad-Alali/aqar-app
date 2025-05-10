// public/js/language-switcher.js
/**
 * Enhanced Language Switcher
 * Provides consistent language switching across all pages
 */

// Dictionary of translations for the entire application
const translations = {
  // App-wide components
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
  'logout': {
    'ar': 'تسجيل الخروج',
    'en': 'Logout'
  },
  'login': {
    'ar': 'تسجيل الدخول',
    'en': 'Login'
  },
  'register': {
    'ar': 'إنشاء حساب',
    'en': 'Register'
  },
  'createAccount': {
    'ar': 'إنشاء حساب جديد',
    'en': 'Create New Account'
  },
  'loginRequired': {
    'ar': 'تسجيل الدخول مطلوب',
    'en': 'Login Required'
  },
  'loginToViewProfile': {
    'ar': 'يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى صفحة الملف الشخصي',
    'en': 'You must login or create an account to access your profile'
  },
  
  // Tabbar items
  'tabBar.home': {
    'ar': 'الرئيسية',
    'en': 'Home'
  },
  'tabBar.search': {
    'ar': 'بحث',
    'en': 'Search'
  },
  'tabBar.favorites': {
    'ar': 'المفضلة',
    'en': 'Favorites'
  },
  'tabBar.profile': {
    'ar': 'حسابي',
    'en': 'Profile'
  },
  
  // Login page
  'email': {
    'ar': 'البريد الإلكتروني',
    'en': 'Email'
  },
  'password': {
    'ar': 'كلمة المرور',
    'en': 'Password'
  },
  'confirmPassword': {
    'ar': 'تأكيد كلمة المرور',
    'en': 'Confirm Password'
  },
  'rememberMe': {
    'ar': 'تذكرني',
    'en': 'Remember Me'
  },
  'loginButton': {
    'ar': 'دخول',
    'en': 'Login'
  },
  'noAccount': {
    'ar': 'ليس لديك حساب؟',
    'en': 'Don\'t have an account?'
  },
  
  // Register page
  'fullName': {
    'ar': 'الاسم الكامل',
    'en': 'Full Name'
  },
  'phone': {
    'ar': 'رقم الجوال',
    'en': 'Phone Number'
  },
  'createPassword': {
    'ar': 'أنشئ كلمة مرور',
    'en': 'Create Password'
  },
  'confirmPassword': {
    'ar': 'تأكيد كلمة المرور',
    'en': 'Confirm Password'
  },
  'registerButton': {
    'ar': 'إنشاء حساب',
    'en': 'Register'
  },
  'haveAccount': {
    'ar': 'لديك حساب بالفعل؟',
    'en': 'Already have an account?'
  },
  
  // Profile page
  'personalInfo': {
    'ar': 'المعلومات الشخصية',
    'en': 'Personal Information'
  },
  'changePhoto': {
    'ar': 'تغيير الصورة',
    'en': 'Change Photo'
  },
  'deletePhoto': {
    'ar': 'حذف الصورة',
    'en': 'Delete Photo'
  },
  'clearFavorites': {
    'ar': 'حذف جميع المفضلات',
    'en': 'Clear All Favorites'
  },
  'deleteAccount': {
    'ar': 'حذف الحساب',
    'en': 'Delete Account'
  },
  'appVersion': {
    'ar': 'نسخة التطبيق: 1.0.0',
    'en': 'App Version: 1.0.0'
  },
  'copyright': {
    'ar': '© 2025 عقار - جميع الحقوق محفوظة',
    'en': '© 2025 Aqar - All Rights Reserved'
  },
  
  // Property details
  'features': {
    'ar': 'المميزات',
    'en': 'Features'
  },
  'bedrooms': {
    'ar': 'غرف النوم',
    'en': 'Bedrooms'
  },
  'bathrooms': {
    'ar': 'الحمامات',
    'en': 'Bathrooms'
  },
  'area': {
    'ar': 'المساحة',
    'en': 'Area'
  },
  'garage': {
    'ar': 'الجراج',
    'en': 'Garage'
  },
  'buildYear': {
    'ar': 'سنة البناء',
    'en': 'Year Built'
  },
  'pool': {
    'ar': 'حمام سباحة',
    'en': 'Swimming Pool'
  },
  'yes': {
    'ar': 'نعم',
    'en': 'Yes'
  },
  'description': {
    'ar': 'الوصف',
    'en': 'Description'
  },
  'location': {
    'ar': 'الموقع',
    'en': 'Location'
  },
  'owner': {
    'ar': 'المالك',
    'en': 'Owner'
  },
  'agent': {
    'ar': 'وكيل عقاري',
    'en': 'Real Estate Agent'
  },
  'call': {
    'ar': 'اتصل',
    'en': 'Call'
  },
  'message': {
    'ar': 'رسالة',
    'en': 'Message'
  },
  'bookViewing': {
    'ar': 'حجز معاينة',
    'en': 'Book Viewing'
  },
  
  // Search page
  'searchPlaceholder': {
    'ar': 'ابحث عن عقار، منطقة، أو حي...',
    'en': 'Search for property, area, or neighborhood...'
  },
  'all': {
    'ar': 'الكل',
    'en': 'All'
  },
  'forSale': {
    'ar': 'للبيع',
    'en': 'For Sale'
  },
  'forRent': {
    'ar': 'للإيجار',
    'en': 'For Rent'
  },
  'apartments': {
    'ar': 'شقق',
    'en': 'Apartments'
  },
  'villas': {
    'ar': 'فلل',
    'en': 'Villas'
  },
  'houses': {
    'ar': 'منازل',
    'en': 'Houses'
  },
  'commercial': {
    'ar': 'تجاري',
    'en': 'Commercial'
  },
  'land': {
    'ar': 'أراضي',
    'en': 'Land'
  },
  'recentSearches': {
    'ar': 'عمليات البحث الأخيرة',
    'en': 'Recent Searches'
  },
  'clearAll': {
    'ar': 'مسح الكل',
    'en': 'Clear All'
  },
  'suggestions': {
    'ar': 'اقتراحات عقارية',
    'en': 'Property Suggestions'
  },
  'viewAll': {
    'ar': 'عرض الكل',
    'en': 'View All'
  },
  'viewDetails': {
    'ar': 'عرض التفاصيل',
    'en': 'View Details'
  },
  'results': {
    'ar': 'عقار',
    'en': 'properties'
  },
  'sortBy': {
    'ar': 'ترتيب حسب',
    'en': 'Sort By'
  },
  'searchOptions': {
    'ar': 'خيارات البحث',
    'en': 'Search Options'
  },
  'propertyType': {
    'ar': 'نوع العقار',
    'en': 'Property Type'
  },
  'transactionType': {
    'ar': 'نوع المعاملة',
    'en': 'Transaction Type'
  },
  'priceRange': {
    'ar': 'نطاق السعر',
    'en': 'Price Range'
  },
  'apply': {
    'ar': 'تطبيق الفلاتر',
    'en': 'Apply Filters'
  },
  'reset': {
    'ar': 'إعادة تعيين',
    'en': 'Reset'
  },
  'noResults': {
    'ar': 'لم يتم العثور على نتائج',
    'en': 'No Results Found'
  },
  'noResultsDesc': {
    'ar': 'حاول تغيير مصطلحات البحث أو الفلاتر للعثور على عقارات.',
    'en': 'Try changing your search terms or filters to find properties.'
  },
  'resetSearch': {
    'ar': 'إعادة ضبط البحث',
    'en': 'Reset Search'
  },
  'searching': {
    'ar': 'جاري البحث...',
    'en': 'Searching...'
  },
  
  // Favorites
  'noFavorites': {
    'ar': 'لا توجد عقارات في المفضلة',
    'en': 'No Favorite Properties'
  },
  'noFavoritesDesc': {
    'ar': 'قم بإضافة العقارات التي تعجبك إلى المفضلة للوصول إليها لاحقًا بسهولة',
    'en': 'Add properties you like to favorites for easy access later'
  },
  'browseProperties': {
    'ar': 'استعرض العقارات',
    'en': 'Browse Properties'
  },
  'removedFromFavorites': {
    'ar': 'تمت إزالة العقار من المفضلة',
    'en': 'Property removed from favorites'
  },
  'addedToFavorites': {
    'ar': 'تمت إضافة العقار إلى المفضلة',
    'en': 'Property added to favorites'
  },
  
  // Edit profile
  'editProfile': {
    'ar': 'تعديل الملف الشخصي',
    'en': 'Edit Profile'
  },
  'address': {
    'ar': 'العنوان',
    'en': 'Address'
  },
  'saveChanges': {
    'ar': 'حفظ التغييرات',
    'en': 'Save Changes'
  },
  'cancel': {
    'ar': 'إلغاء',
    'en': 'Cancel'
  },
  'profileUpdated': {
    'ar': 'تم تحديث الملف الشخصي بنجاح!',
    'en': 'Profile updated successfully!'
  }
};

// Store for active language
let currentLang = null;

/**
 * Initialize the language switcher when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initLanguageSwitcher();
  
  // Always detect and apply language on every page load
  const detectedLang = detectPreferredLanguage();
  applyLanguage(detectedLang);
});

/**
 * Initialize the language switcher UI elements
 */
function initLanguageSwitcher() {
  const switcherButton = document.getElementById('languageSwitcher');
  const languageDropdown = document.getElementById('languageDropdown');
  
  if (!switcherButton || !languageDropdown) {
    console.log('Language switcher elements not found on this page');
    return;
  }
  
  const currentLang = detectPreferredLanguage();
  updateActiveLanguage(currentLang);
  
  // Toggle dropdown on button click
  switcherButton.addEventListener('click', function(e) {
    e.preventDefault();
    const isVisible = languageDropdown.style.display === 'block';
    languageDropdown.style.display = isVisible ? 'none' : 'block';
  });
  
  // Handle language option selection
  const languageOptions = document.querySelectorAll('.language-switcher__option');
  languageOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      
      const lang = this.getAttribute('data-lang');
      
      applyLanguage(lang);
      
      const currentLangSpan = document.querySelector('.language-switcher__current');
      if (currentLangSpan) {
        currentLangSpan.textContent = lang === 'ar' ? 'العربية' : 'English';
      }
      
      languageDropdown.style.display = 'none';
      
      showToast(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English', 'success');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (switcherButton && languageDropdown && 
        !switcherButton.contains(e.target) && 
        !languageDropdown.contains(e.target)) {
      languageDropdown.style.display = 'none';
    }
  });
}

/**
 * Apply the selected language to the entire UI
 * @param {string} lang - The language code ('ar' or 'en')
 */
function applyLanguage(lang) {
  if (!lang || (lang !== 'ar' && lang !== 'en')) {
    console.error('Invalid language code:', lang);
    lang = 'ar'; // Default to Arabic
  }
  
  // Store current language
  currentLang = lang;
  localStorage.setItem('aqar_language', lang);
  
  // Set HTML attributes for language and direction
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Set appropriate font family
  document.body.style.fontFamily = lang === 'ar' ? "'Tajawal', sans-serif" : "'Poppins', sans-serif";
  
  // Translate all elements with data-i18n attributes
  translateAllElements(lang);
  
  // Update the active language in the language switcher
  updateActiveLanguage(lang);
  
  // Update directional CSS styles
  updateDirectionalStyles(lang);
  
  // Update page title
  updatePageTitle(lang);
}

/**
 * Update the active language in the language switcher UI
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updateActiveLanguage(lang) {
  const options = document.querySelectorAll('.language-switcher__option');
  const currentLangSpan = document.querySelector('.language-switcher__current');
  
  options.forEach(option => {
    const optionLang = option.getAttribute('data-lang');
    
    if (optionLang === lang) {
      option.classList.add('language-switcher__option--active');
      
      if (currentLangSpan) {
        currentLangSpan.textContent = lang === 'ar' ? 'العربية' : 'English';
      }
    } else {
      option.classList.remove('language-switcher__option--active');
    }
  });
}

/**
 * Translate all elements with data-i18n attributes
 * @param {string} lang - The language code ('ar' or 'en')
 */
function translateAllElements(lang) {
  // First, translate elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key] && translations[key][lang]) {
      element.textContent = translations[key][lang];
    }
  });
  
  // Additionally, update specific elements that are commonly present
  updateTabBar(lang);
  updatePlaceholders(lang);
  updateButtons(lang);
}

/**
 * Update placeholder text in input fields
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updatePlaceholders(lang) {
  // Update search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.placeholder = translations.searchPlaceholder[lang];
  }
  
  // Update other placeholders
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.placeholder = lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email';
  }
  
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.placeholder = lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password';
  }
  
  const fullNameInput = document.getElementById('fullName');
  if (fullNameInput) {
    fullNameInput.placeholder = lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name';
  }
  
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.placeholder = lang === 'ar' ? 'أدخل رقم الجوال' : 'Enter your phone number';
  }
}

/**
 * Update button text
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updateButtons(lang) {
  // Login button
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.textContent = translations.loginButton[lang];
  }
  
  // Register button
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.textContent = translations.registerButton[lang];
  }
  
  // Save button
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.textContent = translations.saveChanges[lang];
  }
}

/**
 * Update the tab bar navigation items
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updateTabBar(lang) {
  const homeTab = document.querySelector('.tab-bar__item:nth-child(1) .tab-bar__label');
  const searchTab = document.querySelector('.tab-bar__item:nth-child(2) .tab-bar__label');
  const favoritesTab = document.querySelector('.tab-bar__item:nth-child(3) .tab-bar__label');
  const profileTab = document.querySelector('.tab-bar__item:nth-child(4) .tab-bar__label');
  
  if (homeTab) homeTab.textContent = translations['tabBar.home'][lang];
  if (searchTab) searchTab.textContent = translations['tabBar.search'][lang];
  if (favoritesTab) favoritesTab.textContent = translations['tabBar.favorites'][lang];
  if (profileTab) profileTab.textContent = translations['tabBar.profile'][lang];
}

/**
 * Update the page title based on the current page
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updatePageTitle(lang) {
  const pagePath = window.location.pathname;
  const pageName = pagePath.split('/').pop() || 'index.html';
  const baseTitle = translations.appTitle[lang];
  
  let title = baseTitle;
  
  // Set page-specific title
  if (pageName.includes('login')) {
    title = `${translations.login[lang]} - ${baseTitle}`;
  } else if (pageName.includes('register')) {
    title = `${translations.register[lang]} - ${baseTitle}`;
  } else if (pageName.includes('profile')) {
    title = `${translations.profile[lang]} - ${baseTitle}`;
  } else if (pageName.includes('edit-profile')) {
    title = `${translations.editProfile[lang]} - ${baseTitle}`;
  } else if (pageName.includes('favorites')) {
    title = `${translations.favorites[lang]} - ${baseTitle}`;
  } else if (pageName.includes('search')) {
    title = `${translations.search[lang]} - ${baseTitle}`;
  } else if (pageName.includes('property-details')) {
    title = `${translations.viewDetails[lang]} - ${baseTitle}`;
  }
  
  document.title = title;
}

/**
 * Update the CSS for RTL/LTR layouts
 * @param {string} lang - The language code ('ar' or 'en')
 */
function updateDirectionalStyles(lang) {
  const isRTL = lang === 'ar';
  
  // Create or get the style element
  let styleElement = document.getElementById('direction-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'direction-styles';
    document.head.appendChild(styleElement);
  }
  
  // Define RTL/LTR specific styles
  if (isRTL) {
    styleElement.textContent = `
      .profile-menu-icon { margin-left: var(--spacing-md); margin-right: 0; }
      .profile-menu-arrow { transform: rotate(0); }
      .back-button i { transform: rotate(0); }
      .app-header-action:first-child { text-align: right; }
      .app-header-action:last-child { text-align: left; }
      .property-card__location-icon { margin-right: 0; margin-left: var(--spacing-xs); }
      .property-card__feature-icon { margin-right: 0; margin-left: var(--spacing-xs); }
      .property-feature-icon { margin-right: 0; margin-left: var(--spacing-sm); }
      .property-owner-avatar { margin-right: 0; margin-left: var(--spacing-md); }
      .recent-search-icon { margin-right: 0; margin-left: 12px; }
      .property-location-badge i { margin-right: 0; margin-left: 5px; }
      .property-card__feature i { margin-right: 0; margin-left: 5px; }
    `;
  } else {
    styleElement.textContent = `
      .profile-menu-icon { margin-right: var(--spacing-md); margin-left: 0; }
      .profile-menu-arrow { transform: rotate(180deg); }
      .back-button i { transform: rotate(180deg); }
      .app-header-action:first-child { text-align: left; }
      .app-header-action:last-child { text-align: right; }
      .property-card__location-icon { margin-left: 0; margin-right: var(--spacing-xs); }
      .property-card__feature-icon { margin-left: 0; margin-right: var(--spacing-xs); }
      .property-feature-icon { margin-left: 0; margin-right: var(--spacing-sm); }
      .property-owner-avatar { margin-left: 0; margin-right: var(--spacing-md); }
      .recent-search-icon { margin-left: 0; margin-right: 12px; }
      .property-location-badge i { margin-left: 0; margin-right: 5px; }
      .property-card__feature i { margin-left: 0; margin-right: 5px; }
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
  // Check if global showToast function is available
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
  // First check localStorage for saved preference
  const savedLanguage = localStorage.getItem('aqar_language');
  if (savedLanguage === 'ar' || savedLanguage === 'en') {
    return savedLanguage;
  }
  
  // Otherwise check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('ar') ? 'ar' : 'en';
}

/**
 * Get translation for a specific key
 * @param {string} key - The translation key
 * @param {string} lang - The language code (if not provided, uses current language)
 * @returns {string} The translated text
 */
function getTranslation(key, lang = null) {
  lang = lang || currentLang || detectPreferredLanguage();
  
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  
  return key; // Return the key if translation not found
}

// Export functions for use in other modules
export {
  detectPreferredLanguage,
  applyLanguage,
  getTranslation,
  showToast
};