export function updateAuthUI() {
  const userData = localStorage.getItem('aqar_user');
  const isLoggedIn = !!userData;
  
  const authButtons = document.querySelectorAll('.auth-btn');
  const profileButtons = document.querySelectorAll('.profile-btn');
  
  authButtons.forEach(btn => {
    btn.style.display = isLoggedIn ? 'none' : 'block';
  });
  
  profileButtons.forEach(btn => {
    btn.style.display = isLoggedIn ? 'block' : 'none';
  });
  
  if (isLoggedIn) {
    try {
      const user = JSON.parse(userData);
      const userNameElements = document.querySelectorAll('.user-name');
      userNameElements.forEach(el => {
        if (el) el.textContent = user.fullName || 'User';
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  const adminLink = document.getElementById('adminLink');
  if (adminLink && isLoggedIn) {
    adminLink.style.display = 'flex';
  }
  
  console.log("Auth UI updated, user is " + (isLoggedIn ? "logged in" : "logged out"));
}