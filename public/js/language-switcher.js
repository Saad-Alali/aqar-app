// ملف جديد: js/language.js

/**
 * نظام تبديل اللغة للتطبيق
 * يدعم اللغتين العربية والإنجليزية
 */

// تخزين اللغة المختارة في localStorage
const LANGUAGE_KEY = 'aqar_language';

// التحقق من اللغة المفضلة للمستخدم
function detectPreferredLanguage() {
  // 1. تحقق ما إذا كان المستخدم قد اختار لغة محددة مسبقًا
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // 2. تحقق من لغة المتصفح
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('ar') ? 'ar' : 'en';
}

// تعيين اللغة الحالية للتطبيق
function setLanguage(lang) {
  if (lang !== 'ar' && lang !== 'en') {
    // إذا كانت اللغة غير صالحة، استخدم اللغة العربية كافتراضية
    lang = 'ar';
  }
  
  // حفظ اللغة المختارة
  localStorage.setItem(LANGUAGE_KEY, lang);
  
  // تحديث اتجاه الصفحة وخصائص اللغة
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // تحديث الخطوط المناسبة للغة
  updateFonts(lang);
  
  // تحديث كافة النصوص في الصفحة بناءً على اللغة المختارة
  updatePageTexts(lang);
  
  // تحديث اتجاه CSS للعناصر التي تتأثر بتغيير الاتجاه
  updateDirectionalStyles(lang);
  
  return lang;
}

// تحديث الخطوط بناءً على اللغة
function updateFonts(lang) {
  if (lang === 'ar') {
    // للغة العربية، استخدم خط Tajawal
    document.body.style.fontFamily = "'Tajawal', sans-serif";
  } else {
    // للغة الإنجليزية، استخدم خط Poppins أو خط آخر منايب
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }
}

// تحديث نصوص الصفحة بناءً على اللغة المختارة
function updatePageTexts(lang) {
  // التعريف بمفاتيح النصوص المترجمة
  const translations = getTranslations();
  
  // البحث عن جميع العناصر التي تحتوي على خاصية data-i18n لترجمتها
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    // تحقق من وجود ترجمة للمفتاح المحدد
    if (translations[key] && translations[key][lang]) {
      // تحديث نص العنصر
      element.textContent = translations[key][lang];
    }
  });
  
  // تحديث النصوص في العناصر الرئيسية أيضًا
  updateCommonElements(lang, translations);
}

// تحديث العناصر المشتركة في التطبيق
function updateCommonElements(lang, translations) {
  // تحديث عنوان الصفحة
  const title = document.querySelector('title');
  if (title && translations.appTitle) {
    title.textContent = translations.appTitle[lang];
  }
  
  // تحديث عنوان التطبيق في الهيدر
  const appTitle = document.querySelector('.app-title');
  if (appTitle && translations.appTitle) {
    appTitle.textContent = translations.appTitle[lang];
  }
  
  // تحديث أزرار شريط التنقل السفلي
  updateTabBarItems(lang, translations);
}

// تحديث أزرار شريط التنقل السفلي
function updateTabBarItems(lang, translations) {
  if (!translations.tabBar) return;
  
  const tabLabels = document.querySelectorAll('.tab-bar__label');
  const tabKeys = ['home', 'search', 'favorites', 'map', 'profile'];
  
  tabLabels.forEach((label, index) => {
    if (index < tabKeys.length && translations.tabBar[tabKeys[index]]) {
      label.textContent = translations.tabBar[tabKeys[index]][lang];
    }
  });
}

// تحديث أنماط CSS المعتمدة على الاتجاه
function updateDirectionalStyles(lang) {
  const isRtl = lang === 'ar';
  
  // إنشاء أو تحديث عنصر <style> للتعامل مع الاتجاه
  let styleElement = document.getElementById('direction-styles');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'direction-styles';
    document.head.appendChild(styleElement);
  }
  
  // تحديث قواعد CSS بناءً على الاتجاه
  if (isRtl) {
    styleElement.textContent = `
      .app-header-action { margin-left: 0; margin-right: 0; }
      .search__btn { margin-left: 0; margin-right: auto; }
      .property-card__feature-icon { margin-right: 0; margin-left: var(--spacing-xs); }
      .property-card__location-icon { margin-right: 0; margin-left: var(--spacing-xs); }
      .back-button i { margin-right: 0; margin-left: var(--spacing-xs); }
    `;
  } else {
    styleElement.textContent = `
      .app-header-action { margin-right: 0; margin-left: 0; }
      .search__btn { margin-right: 0; margin-left: auto; }
      .property-card__feature-icon { margin-left: 0; margin-right: var(--spacing-xs); }
      .property-card__location-icon { margin-left: 0; margin-right: var(--spacing-xs); }
      .back-button i { margin-left: 0; margin-right: var(--spacing-xs); }
      .app-header-action:first-child { text-align: left; }
      .app-header-action:last-child { text-align: right; }
    `;
  }
}

// الحصول على قاموس الترجمة
function getTranslations() {
  return {
    // العناصر الرئيسية
    appTitle: {
      ar: 'عقار',
      en: 'Aqar'
    },
    propertyListingTitle: {
      ar: 'العقارات المتاحة',
      en: 'Available Properties'
    },
    // عناصر التنقل السفلية
    tabBar: {
      home: {
        ar: 'الرئيسية',
        en: 'Home'
      },
      search: {
        ar: 'بحث',
        en: 'Search'
      },
      favorites: {
        ar: 'المفضلة',
        en: 'Favorites'
      },
      map: {
        ar: 'الخريطة',
        en: 'Map'
      },
      profile: {
        ar: 'حسابي',
        en: 'Profile'
      }
    },
    // نصوص البحث
    search: {
      keywordLabel: {
        ar: 'كلمات البحث',
        en: 'Keywords'
      },
      keywordPlaceholder: {
        ar: 'ادخل كلمات البحث...',
        en: 'Enter keywords...'
      },
      locationLabel: {
        ar: 'الموقع',
        en: 'Location'
      },
      propertyTypeLabel: {
        ar: 'نوع العقار',
        en: 'Property Type'
      },
      priceRangeLabel: {
        ar: 'نطاق السعر',
        en: 'Price Range'
      },
      searchButton: {
        ar: 'بحث',
        en: 'Search'
      },
      allLocations: {
        ar: 'كل المواقع',
        en: 'All Locations'
      },
      allTypes: {
        ar: 'كل الأنواع',
        en: 'All Types'
      },
      anyPrice: {
        ar: 'أي سعر',
        en: 'Any Price'
      }
    },
    // نصوص التسجيل وتسجيل الدخول
    auth: {
      loginRequired: {
        ar: 'تسجيل الدخول مطلوب',
        en: 'Login Required'
      },
      loginToAccess: {
        ar: 'يجب تسجيل الدخول للوصول إلى هذه الميزة',
        en: 'Please log in to access this feature'
      },
      createAccount: {
        ar: 'إنشاء حساب جديد',
        en: 'Create New Account'
      },
      login: {
        ar: 'تسجيل الدخول',
        en: 'Log In'
      },
      loginToFavorite: {
        ar: 'يجب تسجيل الدخول أولاً لإضافة العقار إلى المفضلة',
        en: 'Please log in first to add properties to favorites'
      },
      loginToViewProfile: {
        ar: 'يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى صفحة الملف الشخصي',
        en: 'Log in or create an account to access your profile page'
      }
    },
    // أزرار العقارات
    property: {
      viewDetails: {
        ar: 'عرض التفاصيل',
        en: 'View Details'
      },
      beds: {
        ar: 'غرف',
        en: 'Beds'
      },
      baths: {
        ar: 'حمامات',
        en: 'Baths'
      },
      sqft: {
        ar: 'قدم²',
        en: 'sqft'
      }
    }
  };
}

// تصدير الدوال للاستخدام في ملفات أخرى
export {
  detectPreferredLanguage,
  setLanguage,
  getTranslations
};