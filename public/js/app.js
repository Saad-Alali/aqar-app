import { updateAuthUI } from './auth-utilities.js';

/**
 * Aqar - Real Estate Website
 * Core Application JavaScript
 */

/**
 * Utility Functions
 */
const Aqar = {
    // DOM Manipulation Helpers
    DOM: {
        /**
         * Get element by ID
         */
        getById: (id) => document.getElementById(id),
        
        /**
         * Select elements using a CSS selector
         */
        select: (selector, parent = document) => parent.querySelectorAll(selector),
        
        /**
         * Select the first element matching a CSS selector
         */
        selectOne: (selector, parent = document) => parent.querySelector(selector),
        
        /**
         * Create a new element with optional attributes and content
         */
        create: (tag, attributes = {}, content = '') => {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'class') {
                    element.className = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Set content
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        },
        
        /**
         * Show an element
         */
        show: (element) => {
            if (element) {
                element.classList.remove('hidden');
            }
        },
        
        /**
         * Hide an element
         */
        hide: (element) => {
            if (element) {
                element.classList.add('hidden');
            }
        },
        
        /**
         * Toggle element visibility
         */
        toggle: (element) => {
            if (element) {
                element.classList.toggle('hidden');
            }
        }
    },
    
    // Event Handling
    Events: {
        /**
         * Add event listener to element(s)
         */
        on: (elements, eventType, callback) => {
            if (!elements) return;
            
            if (elements instanceof NodeList || Array.isArray(elements)) {
                elements.forEach(element => element.addEventListener(eventType, callback));
            } else {
                elements.addEventListener(eventType, callback);
            }
        },
        
        /**
         * Remove event listener from element(s)
         */
        off: (elements, eventType, callback) => {
            if (!elements) return;
            
            if (elements instanceof NodeList || Array.isArray(elements)) {
                elements.forEach(element => element.removeEventListener(eventType, callback));
            } else {
                elements.removeEventListener(eventType, callback);
            }
        },
        
        /**
         * Delegate event to child elements matching selector
         */
        delegate: (parent, selector, eventType, callback) => {
            if (!parent) return;
            
            parent.addEventListener(eventType, (event) => {
                const target = event.target.closest(selector);
                if (target && parent.contains(target)) {
                    callback.call(target, event);
                }
            });
        }
    },
    
    // Form Handling
    Forms: {
        /**
         * Validate form inputs
         */
        validate: (form, validations) => {
            let isValid = true;
            
            // Reset all error messages
            Aqar.DOM.select('.form__error', form).forEach(errorElement => {
                errorElement.classList.add('hidden');
            });
            Aqar.DOM.select('.form__input', form).forEach(input => {
                input.classList.remove('form__input--error');
            });
            
            // Validate each field
            Object.entries(validations).forEach(([fieldName, validation]) => {
                const field = form.elements[fieldName];
                if (!field) return;
                
                const { required, pattern, minLength, match, customValidation, errorElement } = validation;
                const value = field.value.trim();
                
                let fieldValid = true;
                
                // Required validation
                if (required && value === '') {
                    fieldValid = false;
                }
                
                // Pattern validation
                if (pattern && value !== '' && !pattern.test(value)) {
                    fieldValid = false;
                }
                
                // Minimum length validation
                if (minLength && value.length < minLength) {
                    fieldValid = false;
                }
                
                // Match other field validation
                if (match && form.elements[match] && value !== form.elements[match].value) {
                    fieldValid = false;
                }
                
                // Custom validation
                if (customValidation && !customValidation(value, form)) {
                    fieldValid = false;
                }
                
                // Show error if invalid
                if (!fieldValid) {
                    field.classList.add('form__input--error');
                    if (errorElement) {
                        Aqar.DOM.show(errorElement);
                    }
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        /**
         * Get form data as an object
         */
        getFormData: (form) => {
            const formData = new FormData(form);
            const data = {};
            
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            return data;
        },
        
        /**
         * Serialize form data to URL-encoded string
         */
        serialize: (form) => {
            const formData = new FormData(form);
            const params = new URLSearchParams();
            
            formData.forEach((value, key) => {
                params.append(key, value);
            });
            
            return params.toString();
        },
        
        /**
         * Set form values from an object
         */
        setFormValues: (form, data) => {
            Object.entries(data).forEach(([key, value]) => {
                const field = form.elements[key];
                if (!field) return;
                
                if (field.type === 'checkbox') {
                    field.checked = !!value;
                } else if (field.type === 'radio') {
                    form.elements[key].forEach(radio => {
                        radio.checked = radio.value === value;
                    });
                } else {
                    field.value = value;
                }
            });
        },
        
        /**
         * Reset form inputs and errors
         */
        resetForm: (form) => {
            form.reset();
            
            Aqar.DOM.select('.form__error', form).forEach(errorElement => {
                errorElement.classList.add('hidden');
            });
            
            Aqar.DOM.select('.form__input', form).forEach(input => {
                input.classList.remove('form__input--error');
            });
        }
    },
    
    // UI Helper Methods
    UI: {
        /**
         * Create an alert message
         */
        showAlert: (type, message, container, autoHide = true, hideDelay = 5000) => {
            if (!container) return;
            
            // Clear existing alerts
            container.innerHTML = '';
            
            // Create alert element
            const alertClass = `alert alert--${type}`;
            const alert = Aqar.DOM.create('div', { class: alertClass }, message);
            
            // Append to container
            container.appendChild(alert);
            
            // Auto hide alert after delay
            if (autoHide) {
                setTimeout(() => {
                    alert.remove();
                }, hideDelay);
            }
        },
        
        /**
         * Toggle button loading state
         */
        toggleButtonLoading: (button, isLoading = true, originalText = null) => {
            if (!button) return;
            
            if (isLoading) {
                // Store original text if not provided
                if (!originalText) {
                    button.dataset.originalText = button.textContent;
                }
                
                button.disabled = true;
                button.classList.add('btn--loading');
            } else {
                button.disabled = false;
                button.classList.remove('btn--loading');
                
                // Restore original text
                if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                    delete button.dataset.originalText;
                } else if (originalText) {
                    button.textContent = originalText;
                }
            }
        },
        
        /**
         * Create a loading spinner
         */
        createSpinner: (container, size = 'md') => {
            if (!container) return null;
            
            const spinnerClass = `spinner spinner--${size}`;
            const spinner = Aqar.DOM.create('div', { class: spinnerClass });
            
            container.appendChild(spinner);
            
            return spinner;
        },
        
        /**
         * Remove loading spinner
         */
        removeSpinner: (spinner) => {
            if (spinner && spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
        }
    },
    
    // HTTP Requests (Simulated)
    HTTP: {
        /**
         * Simulated HTTP request
         */
        request: (url, { method = 'GET', data = null, simulateError = false, delay = 1000 } = {}) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (simulateError) {
                        reject({ error: true, message: 'Simulated request error' });
                    } else {
                        resolve({ success: true, data });
                    }
                }, delay);
            });
        },
        
        /**
         * Simulated GET request
         */
        get: (url, options = {}) => {
            return Aqar.HTTP.request(url, { ...options, method: 'GET' });
        },
        
        /**
         * Simulated POST request
         */
        post: (url, data, options = {}) => {
            return Aqar.HTTP.request(url, { ...options, method: 'POST', data });
        },
        
        /**
         * Simulated PUT request
         */
        put: (url, data, options = {}) => {
            return Aqar.HTTP.request(url, { ...options, method: 'PUT', data });
        },
        
        /**
         * Simulated DELETE request
         */
        delete: (url, options = {}) => {
            return Aqar.HTTP.request(url, { ...options, method: 'DELETE' });
        }
    },
    
    // Local Storage Helpers
    Storage: {
        /**
         * Get item from local storage
         */
        get: (key, parse = true) => {
            try {
                const value = localStorage.getItem(key);
                
                if (value === null) {
                    return null;
                }
                
                return parse ? JSON.parse(value) : value;
            } catch (error) {
                console.error('Error getting item from localStorage:', error);
                return null;
            }
        },
        
        /**
         * Set item in local storage
         */
        set: (key, value, stringify = true) => {
            try {
                const storageValue = stringify ? JSON.stringify(value) : value;
                localStorage.setItem(key, storageValue);
                return true;
            } catch (error) {
                console.error('Error setting item in localStorage:', error);
                return false;
            }
        },
        
        /**
         * Remove item from local storage
         */
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing item from localStorage:', error);
                return false;
            }
        },
        
        /**
         * Clear all items from local storage
         */
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },
    
    // Authentication Helpers
    Auth: {
        /**
         * Storage key for user data
         */
        USER_KEY: 'aqar_user',
        
        /**
         * Check if user is logged in
         */
        isLoggedIn: () => {
            const user = Aqar.Storage.get(Aqar.Auth.USER_KEY);
            return !!user;
        },
        
        /**
         * Get current user data
         */
        getCurrentUser: () => {
            return Aqar.Storage.get(Aqar.Auth.USER_KEY);
        },
        
        /**
         * Set current user data
         */
        setCurrentUser: (userData) => {
            Aqar.Storage.set(Aqar.Auth.USER_KEY, userData);
        },
        
        /**
         * Log out current user
         */
        logout: () => {
            Aqar.Storage.remove(Aqar.Auth.USER_KEY);
        },
        
        /**
         * Redirect to login page if not logged in
         */
        requireAuth: (redirectUrl = 'login.html') => {
            if (!Aqar.Auth.isLoggedIn()) {
                window.location.href = redirectUrl;
            }
        },
        
        /**
         * Redirect to main page if already logged in
         */
        redirectIfAuth: (redirectUrl = 'index.html') => {
            if (Aqar.Auth.isLoggedIn()) {
                window.location.href = redirectUrl;
            }
        }
    }
};

/**
 * Document Ready Function
 */
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Initialize Application
 */
domReady(() => {
    // Mobile Navigation Toggle (for larger screens if needed)
    const navToggle = Aqar.DOM.getById('navToggle');
    const navMenu = Aqar.DOM.getById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav__menu--active');
        });
    }
    
    // Logout Button Functionality
    const logoutBtn = Aqar.DOM.getById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show confirmation dialog
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                Aqar.Auth.logout();
                window.location.href = 'login.html';
            }
        });
    }
    
    // Search Toggle (for mobile app)
    const searchToggle = Aqar.DOM.getById('searchToggle');
    const searchPanel = Aqar.DOM.getById('searchPanel');
    
    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', () => {
            const isHidden = searchPanel.style.display === 'none' || !searchPanel.style.display;
            searchPanel.style.display = isHidden ? 'block' : 'none';
        });
    }
    
    // Filter Button (for mobile app)
    const filterBtn = Aqar.DOM.getById('filterBtn');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const searchPanel = Aqar.DOM.getById('searchPanel');
            if (searchPanel) {
                const isHidden = searchPanel.style.display === 'none' || !searchPanel.style.display;
                searchPanel.style.display = isHidden ? 'block' : 'none';
            }
        });
    }
    
    // Initialize Swipe Actions for Property Cards
    initSwipeActions();
    
    // Initialize Pull-to-Refresh
    initPullToRefresh();
    
    // Update UI based on authentication status
    try {
        updateAuthUI();
    } catch (error) {
        console.warn("Could not update auth UI:", error);
    }
});

/**
 * Initialize Swipe Actions for Property Cards
 * Enables swipe left/right functionality on property cards
 */
function initSwipeActions() {
    const swipeItems = document.querySelectorAll('.swipe-item');
    
    swipeItems.forEach(item => {
        let startX, moveX, deltaX = 0;
        let isSwiping = false;
        
        // Touch events for mobile
        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            
            // Reset any ongoing transition
            item.style.transition = 'none';
        });
        
        item.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            moveX = e.touches[0].clientX;
            deltaX = moveX - startX;
            
            // Limit the swipe distance
            if (deltaX < 0 && deltaX > -150) {
                item.style.transform = `translateX(${deltaX}px)`;
            }
        });
        
        item.addEventListener('touchend', () => {
            isSwiping = false;
            item.style.transition = 'transform 0.3s ease';
            
            // If swiped more than threshold, show actions
            if (deltaX < -50) {
                item.style.transform = 'translateX(-80px)';
            } else {
                item.style.transform = 'translateX(0)';
            }
            
            // Reset swipe state
            deltaX = 0;
        });
        
        // Mouse events for desktop testing
        item.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isSwiping = true;
            
            // Reset any ongoing transition
            item.style.transition = 'none';
            
            // Prevent default to avoid text selection
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isSwiping) return;
            
            moveX = e.clientX;
            deltaX = moveX - startX;
            
            // Limit the swipe distance
            if (deltaX < 0 && deltaX > -150) {
                item.style.transform = `translateX(${deltaX}px)`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (!isSwiping) return;
            
            isSwiping = false;
            item.style.transition = 'transform 0.3s ease';
            
            // If swiped more than threshold, show actions
            if (deltaX < -50) {
                item.style.transform = 'translateX(-80px)';
            } else {
                item.style.transform = 'translateX(0)';
            }
            
            // Reset swipe state
            deltaX = 0;
        });
    });
}

/**
 * Initialize Pull-to-Refresh Functionality
 * Implements pull-to-refresh for mobile app experience
 */
function initPullToRefresh() {
    const pullIndicator = document.getElementById('pullIndicator');
    const appContent = document.querySelector('.app-content');
    
    if (!pullIndicator || !appContent) return;
    
    let startY, moveY, deltaY = 0;
    let isPulling = false;
    let threshold = 80; // Pixels to pull before refresh triggers
    
    appContent.addEventListener('touchstart', (e) => {
        // Only allow pull if at the top of the content
        if (appContent.scrollTop === 0) {
            startY = e.touches[0].clientY;
            isPulling = true;
        }
    });
    
    appContent.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        
        moveY = e.touches[0].clientY;
        deltaY = moveY - startY;
        
        // Only allow pulling down
        if (deltaY > 0) {
            pullIndicator.style.display = 'flex';
            
            // Apply resistance to make the pull feel natural
            const resistance = deltaY * 0.4;
            
            // Limit max pull distance
            if (resistance < threshold) {
                appContent.style.transform = `translateY(${resistance}px)`;
            }
            
            // Prevent default to disable regular scrolling
            e.preventDefault();
        }
    });
    
    appContent.addEventListener('touchend', () => {
        if (!isPulling) return;
        
        isPulling = false;
        appContent.style.transition = 'transform 0.3s ease';
        
        // If pulled enough, trigger refresh
        if (deltaY > threshold / 2) {
            // Show loading state
            pullIndicator.innerHTML = '<div class="pull-indicator__spinner"></div><span>جاري التحديث...</span>';
            
            // Simulate refresh
            setTimeout(() => {
                // Reset
                appContent.style.transform = 'translateY(0)';
                pullIndicator.style.display = 'none';
                
                // Reload page content (for demo)
                // In a real app, you would fetch new data
                location.reload();
            }, 1500);
        } else {
            // Not pulled enough, reset
            appContent.style.transform = 'translateY(0)';
            pullIndicator.style.display = 'none';
        }
        
        // Reset pull state
        deltaY = 0;
    });
}

/**
 * Show Toast Message
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('toast--visible');
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        
        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Make the Aqar object available globally
window.Aqar = Aqar;

// Export the Aqar object for module usage
export { Aqar, showToast, updateAuthUI };