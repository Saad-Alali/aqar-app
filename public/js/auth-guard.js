document.addEventListener('DOMContentLoaded', function() {
    guardRoutes();
});

function guardRoutes() {
    const userData = localStorage.getItem('aqar_user');
    const isLoggedIn = !!userData;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Pages that are accessible without login
    const publicPages = ['login.html', 'register.html'];
    
    // If user is not logged in and trying to access a non-public page, redirect to login
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }
    
    // If user is logged in and trying to access login/register, redirect to home
    if (isLoggedIn && publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return;
    }
}