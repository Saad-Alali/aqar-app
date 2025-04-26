import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

domReady(() => {
    const loginForm = Aqar.DOM.getById('loginForm');
    if (loginForm) {
        initLoginForm(loginForm);
    }
    
    const registerForm = Aqar.DOM.getById('registerForm');
    if (registerForm) {
        initRegisterForm(registerForm);
    }
    
    onAuthStateChanged(auth, user => {
        if (user) {
            getUserData(user.uid).then(userData => {
                const currentUser = {
                    id: user.uid,
                    fullName: user.displayName || userData?.fullName || "",
                    email: user.email || "",
                    phone: userData?.phone || "",
                    address: userData?.address || "",
                    avatarUrl: user.photoURL || userData?.avatarUrl || "img/placeholder.jpg"
                };
                
                Aqar.Auth.setCurrentUser(currentUser);
                
                if (loginForm || registerForm) {
                    window.location.href = 'index.html';
                }
                
                updateAuthUI();
            });
        } else {
            Aqar.Auth.setCurrentUser(null);
            
            const protectedPages = ['profile.html', 'favorites.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                window.location.href = 'login.html';
            }
            
            updateAuthUI();
        }
    });
});

async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

function initLoginForm(form) {
    const formAlerts = Aqar.DOM.getById('formAlerts');
    const loginBtn = Aqar.DOM.getById('loginBtn');
    const emailError = Aqar.DOM.getById('emailError');
    const passwordError = Aqar.DOM.getById('passwordError');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isValid = Aqar.Forms.validate(form, {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorElement: emailError
            },
            password: {
                required: true,
                errorElement: passwordError
            }
        });
        
        if (!isValid) return;
        
        Aqar.UI.toggleButtonLoading(loginBtn);
        
        try {
            const formData = Aqar.Forms.getFormData(form);
            
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            
            Aqar.UI.showAlert('success', 'Login successful! Redirecting...', formAlerts);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later.';
            }
            
            Aqar.UI.showAlert('danger', errorMessage, formAlerts);
            Aqar.UI.toggleButtonLoading(loginBtn, false);
        }
    });
}

function initRegisterForm(form) {
    const formAlerts = Aqar.DOM.getById('formAlerts');
    const registerBtn = Aqar.DOM.getById('registerBtn');
    const fullNameError = Aqar.DOM.getById('fullNameError');
    const emailError = Aqar.DOM.getById('emailError');
    const phoneError = Aqar.DOM.getById('phoneError');
    const passwordError = Aqar.DOM.getById('passwordError');
    const confirmPasswordError = Aqar.DOM.getById('confirmPasswordError');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isValid = Aqar.Forms.validate(form, {
            fullName: {
                required: true,
                minLength: 3,
                errorElement: fullNameError
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorElement: emailError
            },
            phone: {
                pattern: /^[\d\s\+\-\(\)]{7,20}$/,
                errorElement: phoneError
            },
            password: {
                required: true,
                customValidation: (value) => {
                    return value.length >= 8 && 
                           /\d/.test(value) && 
                           /[!@#$%^&*(),.?":{}|<>]/.test(value);
                },
                errorElement: passwordError
            },
            confirmPassword: {
                required: true,
                match: 'password',
                errorElement: confirmPasswordError
            }
        });
        
        if (!isValid) return;
        
        Aqar.UI.toggleButtonLoading(registerBtn);
        
        try {
            const formData = Aqar.Forms.getFormData(form);
            
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            
            await updateProfile(user, {
                displayName: formData.fullName,
                photoURL: "img/placeholder.jpg"
            });
            
            await setDoc(doc(db, "users", user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || "",
                address: "",
                avatarUrl: "img/placeholder.jpg",
                createdAt: new Date(),
                favorites: []
            });
            
            Aqar.UI.showAlert('success', 'Registration successful! Redirecting...', formAlerts);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            }
            
            Aqar.UI.showAlert('danger', errorMessage, formAlerts);
            Aqar.UI.toggleButtonLoading(registerBtn, false);
        }
    });
}

async function logoutUser() {
    try {
        await signOut(auth);
        Aqar.Storage.remove(Aqar.Auth.USER_KEY);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

function updateAuthUI() {
    const isLoggedIn = Aqar.Auth.isLoggedIn();
    const authButtons = document.querySelectorAll('.auth-btn');
    const profileButtons = document.querySelectorAll('.profile-btn');
    
    authButtons.forEach(btn => {
        btn.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    profileButtons.forEach(btn => {
        btn.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    if (isLoggedIn) {
        const user = Aqar.Auth.getCurrentUser();
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.fullName;
        });
    }
}

const extendedAqarAuth = {
    ...Aqar.Auth,
    isLoggedIn: () => {
        return auth.currentUser !== null;
    },
    getCurrentUser: () => {
        return Aqar.Storage.get(Aqar.Auth.USER_KEY);
    },
    setCurrentUser: (userData) => {
        Aqar.Storage.set(Aqar.Auth.USER_KEY, userData);
    },
    logout: logoutUser,
    requireAuth: (redirectUrl = 'login.html') => {
        if (!auth.currentUser) {
            window.location.href = redirectUrl;
        }
    },
    redirectIfAuth: (redirectUrl = 'index.html') => {
        if (auth.currentUser) {
            window.location.href = redirectUrl;
        }
    },
    getCurrentUserId: () => {
        return auth.currentUser ? auth.currentUser.uid : null;
    }
};

Aqar.Auth = extendedAqarAuth;

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                await logoutUser();
            }
        });
    }
});