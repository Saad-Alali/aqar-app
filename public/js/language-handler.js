document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('aqar_language') || 'ar';
    applyLanguage(savedLang);
});

function applyLanguage(lang) {
    if (!lang || (lang !== 'ar' && lang !== 'en')) {
        lang = 'ar';
    }
    
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    if (lang === 'ar') {
        document.body.style.fontFamily = "'Tajawal', sans-serif";
    } else {
        document.body.style.fontFamily = "'Poppins', sans-serif";
    }
    
    updatePageTitle(lang);
    translateElements(lang);
}

function updatePageTitle(lang) {
    const pagePath = window.location.pathname;
    const pageName = pagePath.split('/').pop() || 'index.html';
    const appName = lang === 'ar' ? 'عقار' : 'Aqar';
    
    const titles = {
        ar: {
            'login.html': 'تسجيل الدخول',
            'register.html': 'إنشاء حساب',
            'profile.html': 'حسابي',
            'edit-profile.html': 'تعديل الملف الشخصي',
            'favorites.html': 'المفضلة',
            'search.html': 'بحث',
            'property-details.html': 'تفاصيل العقار',
            'index.html': 'الرئيسية'
        },
        en: {
            'login.html': 'Login',
            'register.html': 'Register',
            'profile.html': 'My Profile',
            'edit-profile.html': 'Edit Profile',
            'favorites.html': 'Favorites',
            'search.html': 'Search',
            'property-details.html': 'Property Details',
            'index.html': 'Home'
        }
    };
    
    if (titles[lang] && titles[lang][pageName]) {
        document.title = `${titles[lang][pageName]} - ${appName}`;
    }
}

function translateElements(lang) {
    const translations = {
        ar: {
            'appTitle': 'عقار',
            'homePage': 'الرئيسية',
            'searchPage': 'بحث',
            'favoritesPage': 'المفضلة',
            'profilePage': 'حسابي',
            'loginRequired': 'تسجيل الدخول مطلوب',
            'loginRequiredDesc': 'يجب تسجيل الدخول أو إنشاء حساب جديد للوصول إلى هذه الميزة',
            'login': 'تسجيل الدخول',
            'createAccount': 'إنشاء حساب جديد',
            'personalInfo': 'المعلومات الشخصية',
            'favorites': 'المفضلة',
            'clearFavorites': 'حذف جميع المفضلات',
            'developerInfo': 'معلومات المطور',
            'language': 'اللغة',
            'deleteAccount': 'حذف الحساب',
            'logout': 'تسجيل الخروج',
            'appVersion': 'نسخة التطبيق: 1.0.0',
            'copyright': '© 2025 عقار - جميع الحقوق محفوظة',
            'forSale': 'للبيع',
            'forRent': 'للإيجار',
            'apartments': 'شقق',
            'villas': 'فلل',
            'houses': 'منازل',
            'commercial': 'مباني تجارية',
            'all': 'الكل',
            'noFavorites': 'لا توجد عقارات في المفضلة',
            'noFavoritesDesc': 'قم بإضافة العقارات التي تعجبك إلى المفضلة للوصول إليها لاحقًا بسهولة',
            'browseProperties': 'استعرض العقارات',
            'deleteAllFavorites': 'حذف جميع المفضلات',
            'sortByNewest': 'ترتيب حسب الأحدث',
            'sortByPrice': 'ترتيب حسب السعر'
        },
        en: {
            'appTitle': 'Aqar',
            'homePage': 'Home',
            'searchPage': 'Search',
            'favoritesPage': 'Favorites',
            'profilePage': 'My Profile',
            'loginRequired': 'Login Required',
            'loginRequiredDesc': 'You must log in or create an account to access this feature',
            'login': 'Login',
            'createAccount': 'Create Account',
            'personalInfo': 'Personal Information',
            'favorites': 'Favorites',
            'clearFavorites': 'Clear All Favorites',
            'developerInfo': 'Developer Info',
            'language': 'Language',
            'deleteAccount': 'Delete Account',
            'logout': 'Logout',
            'appVersion': 'App Version: 1.0.0',
            'copyright': '© 2025 Aqar - All Rights Reserved',
            'forSale': 'For Sale',
            'forRent': 'For Rent',
            'apartments': 'Apartments',
            'villas': 'Villas',
            'houses': 'Houses',
            'commercial': 'Commercial',
            'all': 'All',
            'noFavorites': 'No Favorites Found',
            'noFavoritesDesc': 'Add properties to your favorites for easy access later',
            'browseProperties': 'Browse Properties',
            'deleteAllFavorites': 'Delete All Favorites',
            'sortByNewest': 'Sort by Newest',
            'sortByPrice': 'Sort by Price'
        }
    };
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}