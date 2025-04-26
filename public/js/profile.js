import { auth, db, storage } from './firebase.js';
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

domReady(() => {
    const profilePage = Aqar.DOM.getById('profileInfoView');
    if (!profilePage) return;
    
    Aqar.Auth.requireAuth();
    
    initProfile();
    initProfileEdit();
    initPasswordChange();
    initAvatarUpload();
    initFavorites();
});

async function initProfile() {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            const fullUserData = {
                id: user.uid,
                fullName: user.displayName || userData.fullName || "",
                email: user.email || "",
                phone: userData.phone || "",
                address: userData.address || "",
                avatarUrl: user.photoURL || userData.avatarUrl || "img/placeholder.jpg"
            };
            
            updateProfileDisplay(fullUserData);
            Aqar.Auth.setCurrentUser(fullUserData);
        } else {
            await updateDoc(doc(db, "users", user.uid), {
                fullName: user.displayName || "",
                email: user.email || "",
                phone: "",
                address: "",
                avatarUrl: user.photoURL || "img/placeholder.jpg",
                updatedAt: new Date(),
                favorites: []
            });
            
            const basicUserData = {
                id: user.uid,
                fullName: user.displayName || "",
                email: user.email || "",
                phone: "",
                address: "",
                avatarUrl: user.photoURL || "img/placeholder.jpg"
            };
            
            updateProfileDisplay(basicUserData);
            Aqar.Auth.setCurrentUser(basicUserData);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

function updateProfileDisplay(user) {
    const profileName = Aqar.DOM.getById('profileName');
    const profileEmail = Aqar.DOM.getById('profileEmail');
    const profileAvatar = Aqar.DOM.getById('profileAvatar');
    
    if (profileName) profileName.textContent = user.fullName || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profileAvatar) profileAvatar.src = user.avatarUrl || 'img/placeholder.jpg';
    
    const viewFullName = Aqar.DOM.getById('viewFullName');
    const viewEmail = Aqar.DOM.getById('viewEmail');
    const viewPhone = Aqar.DOM.getById('viewPhone');
    const viewAddress = Aqar.DOM.getById('viewAddress');
    
    if (viewFullName) viewFullName.textContent = user.fullName || 'Not provided';
    if (viewEmail) viewEmail.textContent = user.email || 'Not provided';
    if (viewPhone) viewPhone.textContent = user.phone || 'Not provided';
    if (viewAddress) viewAddress.textContent = user.address || 'Not provided';
}

function initProfileEdit() {
    const editProfileBtn = Aqar.DOM.getById('editProfileBtn');
    const cancelEditBtn = Aqar.DOM.getById('cancelEditBtn');
    const profileInfoView = Aqar.DOM.getById('profileInfoView');
    const profileInfoEdit = Aqar.DOM.getById('profileInfoEdit');
    const profileEditForm = Aqar.DOM.getById('profileEditForm');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) return;
            
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    const editFullName = Aqar.DOM.getById('editFullName');
                    const editEmail = Aqar.DOM.getById('editEmail');
                    const editPhone = Aqar.DOM.getById('editPhone');
                    const editAddress = Aqar.DOM.getById('editAddress');
                    
                    if (editFullName) editFullName.value = user.displayName || userData.fullName || '';
                    if (editEmail) editEmail.value = user.email || '';
                    if (editPhone) editPhone.value = userData.phone || '';
                    if (editAddress) editAddress.value = userData.address || '';
                    
                    Aqar.DOM.hide(profileInfoView);
                    Aqar.DOM.show(profileInfoEdit);
                }
            } catch (error) {
                console.error("Error fetching user data for edit:", error);
            }
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            Aqar.DOM.hide(profileInfoEdit);
            Aqar.DOM.show(profileInfoView);
            
            if (profileEditForm) profileEditForm.reset();
        });
    }
    
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const profileAlerts = Aqar.DOM.getById('profileAlerts');
            const saveProfileBtn = Aqar.DOM.getById('saveProfileBtn');
            const editFullNameError = Aqar.DOM.getById('editFullNameError');
            const editEmailError = Aqar.DOM.getById('editEmailError');
            const editPhoneError = Aqar.DOM.getById('editPhoneError');
            
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
            
            Aqar.UI.toggleButtonLoading(saveProfileBtn);
            
            try {
                const formData = Aqar.Forms.getFormData(profileEditForm);
                
                const user = auth.currentUser;
                if (!user) throw new Error("User not authenticated");
                
                await updateProfile(user, {
                    displayName: formData.fullName
                });
                
                await updateDoc(doc(db, "users", user.uid), {
                    fullName: formData.fullName,
                    phone: formData.phone || "",
                    address: formData.address || "",
                    updatedAt: new Date()
                });
                
                const updatedUser = {
                    id: user.uid,
                    fullName: formData.fullName,
                    email: user.email,
                    phone: formData.phone || "",
                    address: formData.address || "",
                    avatarUrl: user.photoURL || "img/placeholder.jpg"
                };
                
                updateProfileDisplay(updatedUser);
                Aqar.Auth.setCurrentUser(updatedUser);
                
                Aqar.UI.showAlert('success', 'Profile updated successfully!', profileAlerts);
                
                Aqar.DOM.hide(profileInfoEdit);
                Aqar.DOM.show(profileInfoView);
                
            } catch (error) {
                console.error("Error updating profile:", error);
                Aqar.UI.showAlert('danger', error.message || 'Failed to update profile. Please try again.', profileAlerts);
            } finally {
                Aqar.UI.toggleButtonLoading(saveProfileBtn, false);
            }
        });
    }
}

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
        
        const isValid = Aqar.Forms.validate(changePasswordForm, {
            currentPassword: {
                required: true,
                errorElement: currentPasswordError
            },
            newPassword: {
                required: true,
                customValidation: (value) => {
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
        
        Aqar.UI.toggleButtonLoading(changePasswordBtn);
        
        try {
            const formData = Aqar.Forms.getFormData(changePasswordForm);
            
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");
            
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );
            
            await reauthenticateWithCredential(user, credential);
            
            await updatePassword(user, formData.newPassword);
            
            Aqar.UI.showAlert('success', 'Password changed successfully!', profileAlerts);
            
            changePasswordForm.reset();
            
        } catch (error) {
            console.error("Error changing password:", error);
            
            let errorMessage = 'Failed to change password. Please try again.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Current password is incorrect.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'New password is too weak.';
            }
            
            Aqar.UI.showAlert('danger', errorMessage, profileAlerts);
        } finally {
            Aqar.UI.toggleButtonLoading(changePasswordBtn, false);
        }
    });
}

function initAvatarUpload() {
    const avatarUpload = Aqar.DOM.getById('avatarUpload');
    const profileAvatar = Aqar.DOM.getById('profileAvatar');
    const profileAlerts = Aqar.DOM.getById('profileAlerts');
    
    if (!avatarUpload || !profileAvatar) return;
    
    avatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            Aqar.UI.showAlert('danger', 'Please select an image file.', profileAlerts);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            Aqar.UI.showAlert('danger', 'Image size should be less than 5MB.', profileAlerts);
            return;
        }
        
        try {
            Aqar.UI.showAlert('warning', 'Uploading image...', profileAlerts);
            
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");
            
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, file);
            
            const downloadURL = await getDownloadURL(storageRef);
            
            await updateProfile(user, {
                photoURL: downloadURL
            });
            
            await updateDoc(doc(db, "users", user.uid), {
                avatarUrl: downloadURL,
                updatedAt: new Date()
            });
            
            profileAvatar.src = downloadURL;
            
            const currentUser = Aqar.Auth.getCurrentUser();
            if (currentUser) {
                currentUser.avatarUrl = downloadURL;
                Aqar.Auth.setCurrentUser(currentUser);
            }
            
            Aqar.UI.showAlert('success', 'Profile image updated successfully!', profileAlerts);
            
        } catch (error) {
            console.error("Error uploading image:", error);
            Aqar.UI.showAlert('danger', error.message || 'Failed to upload image. Please try again.', profileAlerts);
        }
    });
}

async function initFavorites() {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) return;
    
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const favorites = userData.favorites || [];
            
            const favoritesContainer = Aqar.DOM.getById('favoritesWithItems');
            const emptyFavorites = Aqar.DOM.getById('favoritesEmpty');
            
            if (favoritesContainer && emptyFavorites) {
                if (favorites.length === 0) {
                    favoritesContainer.style.display = 'none';
                    emptyFavorites.style.display = 'block';
                } else {
                    favoritesContainer.style.display = 'block';
                    emptyFavorites.style.display = 'none';
                    
                    favoritesContainer.innerHTML = '';
                    
                    for (const propertyId of favorites) {
                        try {
                            const propertyDoc = await getDoc(doc(db, "properties", propertyId));
                            
                            if (propertyDoc.exists()) {
                                const property = propertyDoc.data();
                                property.id = propertyDoc.id;
                                
                                if (property.price) {
                                    property.priceFormatted = `$${property.price.toLocaleString()}`;
                                }
                                
                                const favoriteItem = createFavoriteItem(property);
                                favoritesContainer.appendChild(favoriteItem);
                            }
                        } catch (error) {
                            console.error(`Error fetching property ${propertyId}:`, error);
                        }
                    }
                    
                    attachFavoriteItemEvents();
                }
            }
        }
    } catch (error) {
        console.error("Error fetching favorites:", error);
    }
}

function createFavoriteItem(property) {
    const itemElement = document.createElement('div');
    itemElement.className = 'favorite-property swipe-item';
    itemElement.dataset.id = property.id;
    
    itemElement.innerHTML = `
        <div class="favorite-property__content">
            <div class="favorite-property__image">
                <img src="${property.imageUrl}" alt="${property.title}">
            </div>
            <div class="favorite-property__details">
                <h3 class="favorite-property__title">${property.title}</h3>
                <div class="favorite-property__location">
                    <i class="fas fa-map-marker-alt"></i> ${property.location}
                </div>
                <div class="favorite-property__price">${property.priceFormatted}</div>
                <div class="favorite-property__features">
                    <div class="favorite-property__feature">
                        <i class="fas fa-bed"></i> ${property.features.bedrooms}
                    </div>
                    <div class="favorite-property__feature">
                        <i class="fas fa-bath"></i> ${property.features.bathrooms}
                    </div>
                    <div class="favorite-property__feature">
                        <i class="fas fa-ruler-combined"></i> ${property.features.area} قدم²
                    </div>
                </div>
            </div>
        </div>
        <div class="favorite-property__actions">
            <a href="#" class="favorite-property__action favorite-property__action--delete" title="إزالة من المفضلة">
                <i class="fas fa-trash-alt"></i>
            </a>
            <a href="#" class="favorite-property__action" title="مشاركة">
                <i class="fas fa-share-alt"></i>
            </a>
        </div>
    `;
    
    return itemElement;
}

function attachFavoriteItemEvents() {
    const deleteButtons = document.querySelectorAll('.favorite-property__action--delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const propertyItem = this.closest('.favorite-property');
            const propertyId = propertyItem.dataset.id;
            
            if (propertyId) {
                try {
                    const userId = Aqar.Auth.getCurrentUserId();
                    if (!userId) return;
                    
                    const userDoc = await getDoc(doc(db, "users", userId));
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const favorites = userData.favorites || [];
                        
                        const updatedFavorites = favorites.filter(id => id !== propertyId);
                        
                        await updateDoc(doc(db, "users", userId), {
                            favorites: updatedFavorites,
                            updatedAt: new Date()
                        });
                        
                        propertyItem.style.transition = 'all 0.3s ease';
                        propertyItem.style.opacity = '0';
                        propertyItem.style.height = '0';
                        propertyItem.style.marginBottom = '0';
                        propertyItem.style.overflow = 'hidden';
                        
                        setTimeout(() => {
                            propertyItem.remove();
                            
                            const remainingProperties = document.querySelectorAll('.favorite-property');
                            if (remainingProperties.length === 0) {
                                const favoritesContainer = Aqar.DOM.getById('favoritesWithItems');
                                const emptyFavorites = Aqar.DOM.getById('favoritesEmpty');
                                
                                if (favoritesContainer && emptyFavorites) {
                                    favoritesContainer.style.display = 'none';
                                    emptyFavorites.style.display = 'block';
                                }
                            }
                        }, 300);
                    }
                } catch (error) {
                    console.error("Error removing from favorites:", error);
                }
            }
        });
    });
}