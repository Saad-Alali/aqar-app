/**
 * Aqar - Real Estate Website
 * User Profile JavaScript
 */

/**
 * Initialize Profile functionality
 */
domReady(() => {
    // Check if on profile page
    const profilePage = Aqar.DOM.getById('profileInfoView');
    if (!profilePage) return;
    
    // Require authentication for profile page
    Aqar.Auth.requireAuth();
    
    // Initialize profile
    initProfile();
    
    // Initialize profile editing
    initProfileEdit();
    
    // Initialize password change
    initPasswordChange();
    
    // Initialize avatar upload
    initAvatarUpload();
});

/**
 * Initialize Profile Display
 */
function initProfile() {
    // Get current user data
    const user = Aqar.Auth.getCurrentUser();
    if (!user) return;
    
    // Update profile display
    updateProfileDisplay(user);
}

/**
 * Update Profile Display with User Data
 * @param {Object} user - User data
 */
function updateProfileDisplay(user) {
    // Update profile header
    const profileName = Aqar.DOM.getById('profileName');
    const profileEmail = Aqar.DOM.getById('profileEmail');
    const profileAvatar = Aqar.DOM.getById('profileAvatar');
    
    if (profileName) profileName.textContent = user.fullName || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profileAvatar) profileAvatar.src = user.avatarUrl || 'img/placeholder.jpg';
    
    // Update profile info view
    const viewFullName = Aqar.DOM.getById('viewFullName');
    const viewEmail = Aqar.DOM.getById('viewEmail');
    const viewPhone = Aqar.DOM.getById('viewPhone');
    const viewAddress = Aqar.DOM.getById('viewAddress');
    
    if (viewFullName) viewFullName.textContent = user.fullName || 'Not provided';
    if (viewEmail) viewEmail.textContent = user.email || 'Not provided';
    if (viewPhone) viewPhone.textContent = user.phone || 'Not provided';
    if (viewAddress) viewAddress.textContent = user.address || 'Not provided';
}

/**
 * Initialize Profile Editing Functionality
 */
function initProfileEdit() {
    const editProfileBtn = Aqar.DOM.getById('editProfileBtn');
    const cancelEditBtn = Aqar.DOM.getById('cancelEditBtn');
    const profileInfoView = Aqar.DOM.getById('profileInfoView');
    const profileInfoEdit = Aqar.DOM.getById('profileInfoEdit');
    const profileEditForm = Aqar.DOM.getById('profileEditForm');
    
    // Set up edit button click handler
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            // Get current user data
            const user = Aqar.Auth.getCurrentUser();
            
            // Populate edit form with user data
            const editFullName = Aqar.DOM.getById('editFullName');
            const editEmail = Aqar.DOM.getById('editEmail');
            const editPhone = Aqar.DOM.getById('editPhone');
            const editAddress = Aqar.DOM.getById('editAddress');
            
            if (editFullName) editFullName.value = user.fullName || '';
            if (editEmail) editEmail.value = user.email || '';
            if (editPhone) editPhone.value = user.phone || '';
            if (editAddress) editAddress.value = user.address || '';
            
            // Show edit form, hide view form
            Aqar.DOM.hide(profileInfoView);
            Aqar.DOM.show(profileInfoEdit);
        });
    }
    
    // Set up cancel button click handler
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            // Hide edit form, show view form
            Aqar.DOM.hide(profileInfoEdit);
            Aqar.DOM.show(profileInfoView);
            
            // Reset form
            if (profileEditForm) profileEditForm.reset();
        });
    }
    
    // Set up form submission handler
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const profileAlerts = Aqar.DOM.getById('profileAlerts');
            const saveProfileBtn = Aqar.DOM.getById('saveProfileBtn');
            const editFullNameError = Aqar.DOM.getById('editFullNameError');
            const editEmailError = Aqar.DOM.getById('editEmailError');
            const editPhoneError = Aqar.DOM.getById('editPhoneError');
            
            // Validate form
            const isValid = Aqar.Forms.validate(profileEditForm, {
                fullName: {
                    required: true,
                    minLength: 3,
                    errorElement: editFullNameError
                },
                email: {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    errorElement: editEmailError
                },
                phone: {
                    pattern: /^[\d\s\+\-\(\)]{7,20}$/,
                    errorElement: editPhoneError
                }
            });
            
            if (!isValid) return;
            
            // Show loading state
            Aqar.UI.toggleButtonLoading(saveProfileBtn);
            
            try {
                // Get form data
                const formData = Aqar.Forms.getFormData(profileEditForm);
                
                // Simulate API call to update profile
                const response = await simulateProfileUpdate(formData);
                
                // Update stored user data
                const user = Aqar.Auth.getCurrentUser();
                const updatedUser = {
                    ...user,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address
                };
                
                Aqar.Auth.setCurrentUser(updatedUser);
                
                // Update profile display
                updateProfileDisplay(updatedUser);
                
                // Show success message
                Aqar.UI.showAlert('success', 'Profile updated successfully!', profileAlerts);
                
                // Hide edit form, show view form
                Aqar.DOM.hide(profileInfoEdit);
                Aqar.DOM.show(profileInfoView);
                
            } catch (error) {
                // Show error message
                Aqar.UI.showAlert('danger', error.message || 'Failed to update profile. Please try again.', profileAlerts);
            } finally {
                // Remove loading state
                Aqar.UI.toggleButtonLoading(saveProfileBtn, false);
            }
        });
    }
}

/**
 * Initialize Password Change Functionality
 */
function initPasswordChange() {
    const changePasswordForm = Aqar.DOM.getById('changePasswordForm');
    
    if (!changePasswordForm) return;
    
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const profileAlerts = Aqar.DOM.getById('profileAlerts');
        const changePasswordBtn = Aqar.DOM.getById('changePasswordBtn');
        const currentPasswordError = Aqar.DOM.getById('currentPasswordError');
        const newPasswordError = Aqar.DOM.getById('newPasswordError');
        const confirmNewPasswordError = Aqar.DOM.getById('confirmNewPasswordError');
        
        // Validate form
        const isValid = Aqar.Forms.validate(changePasswordForm, {
            currentPassword: {
                required: true,
                errorElement: currentPasswordError
            },
            newPassword: {
                required: true,
                customValidation: (value) => {
                    // At least 8 characters, with numbers and special characters
                    return value.length >= 8 && 
                           /\d/.test(value) && 
                           /[!@#$%^&*(),.?":{}|<>]/.test(value);
                },
                errorElement: newPasswordError
            },
            confirmNewPassword: {
                required: true,
                match: 'newPassword',
                errorElement: confirmNewPasswordError
            }
        });
        
        if (!isValid) return;
        
        // Show loading state
        Aqar.UI.toggleButtonLoading(changePasswordBtn);
        
        try {
            // Get form data
            const formData = Aqar.Forms.getFormData(changePasswordForm);
            
            // Simulate API call to change password
            await simulatePasswordChange(formData);
            
            // Show success message
            Aqar.UI.showAlert('success', 'Password changed successfully!', profileAlerts);
            
            // Reset form
            changePasswordForm.reset();
            
        } catch (error) {
            // Show error message
            Aqar.UI.showAlert('danger', error.message || 'Failed to change password. Please try again.', profileAlerts);
        } finally {
            // Remove loading state
            Aqar.UI.toggleButtonLoading(changePasswordBtn, false);
        }
    });
}

/**
 * Initialize Avatar Upload Functionality
 */
function initAvatarUpload() {
    const avatarUpload = Aqar.DOM.getById('avatarUpload');
    const profileAvatar = Aqar.DOM.getById('profileAvatar');
    const profileAlerts = Aqar.DOM.getById('profileAlerts');
    
    if (!avatarUpload || !profileAvatar) return;
    
    avatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file (image only)
        if (!file.type.startsWith('image/')) {
            Aqar.UI.showAlert('danger', 'Please select an image file.', profileAlerts);
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Aqar.UI.showAlert('danger', 'Image size should be less than 5MB.', profileAlerts);
            return;
        }
        
        try {
            // Show loading message
            Aqar.UI.showAlert('warning', 'Uploading image...', profileAlerts);
            
            // Read file as data URL
            const reader = new FileReader();
            reader.onload = async (event) => {
                const imageDataUrl = event.target.result;
                
                // Simulate image upload
                await simulateAvatarUpload(imageDataUrl);
                
                // Update avatar display
                profileAvatar.src = imageDataUrl;
                
                // Update stored user data
                const user = Aqar.Auth.getCurrentUser();
                const updatedUser = {
                    ...user,
                    avatarUrl: imageDataUrl
                };
                
                Aqar.Auth.setCurrentUser(updatedUser);
                
                // Show success message
                Aqar.UI.showAlert('success', 'Profile image updated successfully!', profileAlerts);
            };
            
            reader.onerror = () => {
                throw new Error('Failed to read file.');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            // Show error message
            Aqar.UI.showAlert('danger', error.message || 'Failed to upload image. Please try again.', profileAlerts);
        }
    });
}

/**
 * Simulate Profile Update API Call
 * @param {Object} profileData - Profile update data
 * @returns {Promise<Object>} - Promise resolving to success response
 */
async function simulateProfileUpdate(profileData) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // Simulate validation
            if (profileData.email && !profileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                reject({ message: 'Invalid email format.' });
                return;
            }
            
            if (profileData.phone && !profileData.phone.match(/^[\d\s\+\-\(\)]{7,20}$/)) {
                reject({ message: 'Invalid phone number format.' });
                return;
            }
            
            // Simulate success response
            resolve({ success: true });
        }, 1500);
    });
}

/**
 * Simulate Password Change API Call
 * @param {Object} passwordData - Password change data
 * @returns {Promise<Object>} - Promise resolving to success response
 */
async function simulatePasswordChange(passwordData) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // Simulate validation (current password check)
            if (passwordData.currentPassword === 'wrongpassword') {
                reject({ message: 'Current password is incorrect.' });
                return;
            }
            
            // Simulate password requirements
            if (passwordData.newPassword.length < 8) {
                reject({ message: 'New password must be at least 8 characters.' });
                return;
            }
            
            if (!(/\d/.test(passwordData.newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword))) {
                reject({ message: 'New password must include numbers and special characters.' });
                return;
            }
            
            if (passwordData.newPassword !== passwordData.confirmNewPassword) {
                reject({ message: 'New passwords do not match.' });
                return;
            }
            
            // Simulate success response
            resolve({ success: true });
        }, 1500);
    });
}

/**
 * Simulate Avatar Upload API Call
 * @param {string} imageDataUrl - Base64 encoded image data
 * @returns {Promise<Object>} - Promise resolving to success response
 */
async function simulateAvatarUpload(imageDataUrl) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Simulate success response
            resolve({ success: true, avatarUrl: imageDataUrl });
        }, 1500);
    });
}