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
}

function updatePageTitle(lang) {
    const pagePath = window.location.pathname;
    const pageName = pagePath.split('/').pop() || 'index.html';
    const appName = lang === 'ar' ? 'عقار' : 'Aqar';
    
    let pageTitle = '';
    
    if (pageName.includes('login')) {
        pageTitle = lang === 'ar' ? 'تسجيل الدخول' : 'Login';
    } else if (pageName.includes('register')) {
        pageTitle = lang === 'ar' ? 'إنشاء حساب' : 'Register';
    } else if (pageName.includes('profile')) {
        pageTitle = lang === 'ar' ? 'حسابي' : 'My Profile';
    } else if (pageName.includes('edit-profile')) {
        pageTitle = lang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile';
    } else if (pageName.includes('favorites')) {
        pageTitle = lang === 'ar' ? 'المفضلة' : 'Favorites';
    } else if (pageName.includes('search')) {
        pageTitle = lang === 'ar' ? 'بحث' : 'Search';
    } else if (pageName.includes('property-details')) {
        pageTitle = lang === 'ar' ? 'تفاصيل العقار' : 'Property Details';
    }
    
    if (pageTitle) {
        document.title = `${pageTitle} - ${appName}`;
    }
}