/**
 * Aqar - Real Estate Website
 * Authentication JavaScript
 */

/**
 * Initialize Authentication functionality
 */
domReady(() => {
    // Check if on login page
    const loginForm = Aqar.DOM.getById('loginForm');
    if (loginForm) {
        initLoginForm(loginForm);
    }
    
    // Check if on register page
    const registerForm = Aqar.DOM.getById('registerForm');
    if (registerForm) {
        initRegisterForm(registerForm);
    }
    
    // If on auth page and already logged in, redirect to home
    if ((loginForm || registerForm) && Aqar.Auth.isLoggedIn()) {
        Aqar.Auth.redirectIfAuth();
    }
});

/**
 * Initialize Login Form
 * @param {HTMLFormElement} form - Login form element
 */
function initLoginForm(form) {
    const formAlerts = Aqar.DOM.getById('formAlerts');
    const loginBtn = Aqar.DOM.getById('loginBtn');
    const emailError = Aqar.DOM.getById('emailError');
    const passwordError = Aqar.DOM.getById('passwordError');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
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
        
        // Show loading state
        Aqar.UI.toggleButtonLoading(loginBtn);
        
        try {
            // Get form data
            const formData = Aqar.Forms.getFormData(form);
            
            // Simulate login API call
            const response = await simulateLogin(formData);
            
            // Save user data
            Aqar.Auth.setCurrentUser(response.user);
            
            // Show success message
            Aqar.UI.showAlert('success', 'Login successful! Redirecting...', formAlerts);
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            // Show error message
            Aqar.UI.showAlert('danger', error.message || 'Login failed. Please try again.', formAlerts);
            Aqar.UI.toggleButtonLoading(loginBtn, false);
        }
    });
}

/**
 * Initialize Registration Form
 * @param {HTMLFormElement} form - Registration form element
 */
function initRegisterForm(form) {
    const formAlerts = Aqar.DOM.getById('formAlerts');
    const registerBtn = Aqar.DOM.getById('registerBtn');
    const fullNameError = Aqar.DOM.getById('fullNameError');
    const emailError = Aqar.DOM.getById('emailError');
    const passwordError = Aqar.DOM.getById('passwordError');
    const confirmPasswordError = Aqar.DOM.getById('confirmPasswordError');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
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
            password: {
                required: true,
                customValidation: (value) => {
                    // At least 8 characters, with numbers and special characters
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
        
        // Show loading state
        Aqar.UI.toggleButtonLoading(registerBtn);
        
        try {
            // Get form data
            const formData = Aqar.Forms.getFormData(form);
            
            // Simulate registration API call
            const response = await simulateRegistration(formData);
            
            // Save user data
            Aqar.Auth.setCurrentUser(response.user);
            
            // Show success message
            Aqar.UI.showAlert('success', 'Registration successful! Redirecting...', formAlerts);
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            // Show error message
            Aqar.UI.showAlert('danger', error.message || 'Registration failed. Please try again.', formAlerts);
            Aqar.UI.toggleButtonLoading(registerBtn, false);
        }
    });
}

/**
 * Simulate Login API Call
 * @param {Object} userData - User login data
 * @returns {Promise<Object>} - Promise resolving to user data
 */
async function simulateLogin(userData) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // For demo purposes, accept any email with valid format
            // In a real app, this would be a server-side check
            if (!userData.email || !userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                reject({ message: 'Invalid email format.' });
                return;
            }
            
            // Check for minimum password length
            if (!userData.password || userData.password.length < 6) {
                reject({ message: 'Password must be at least 6 characters.' });
                return;
            }
            
            // Simulate success response
            resolve({
                success: true,
                user: {
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    fullName: userData.email.split('@')[0].replace(/[.0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    email: userData.email,
                    phone: '+1 (555) 123-4567',
                    address: '123 Main Street, Anytown, USA',
                    avatarUrl: 'img/placeholder.jpg'
                }
            });
        }, 1500);
    });
}

/**
 * Simulate Registration API Call
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Promise resolving to user data
 */
async function simulateRegistration(userData) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // For demo purposes, check if simulated user already exists
            // In a real app, this would be a server-side check
            const existingUsers = Aqar.Storage.get('aqar_users') || [];
            
            const userExists = existingUsers.some(user => user.email === userData.email);
            
            if (userExists) {
                reject({ message: 'User with this email already exists.' });
                return;
            }
            
            // Create new user
            const newUser = {
                id: 'usr_' + Math.random().toString(36).substr(2, 9),
                fullName: userData.fullName,
                email: userData.email,
                phone: '',
                address: '',
                avatarUrl: 'img/placeholder.jpg'
            };
            
            // Save to "database" (localStorage)
            existingUsers.push(newUser);
            Aqar.Storage.set('aqar_users', existingUsers);
            
            // Simulate success response
            resolve({
                success: true,
                user: newUser
            });
        }, 2000);
    });
}