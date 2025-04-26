import { db, auth } from './firebase.js';
import { doc, getDoc } from "firebase/firestore";
import { addToFavorites, removeFromFavorites } from './favorites.js';

domReady(() => {
    // Check if on property details page
    const propertyDetailsContainer = document.querySelector('.property-details-container');
    if (!propertyDetailsContainer) return;
    
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        showError('Property ID not provided');
        return;
    }
    
    // Load property details
    loadPropertyDetails(propertyId);
    
    // Initialize favorite button
    initFavoriteButton(propertyId);
    
    // Initialize share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            shareProperty(propertyId);
        });
    }
});

/**
 * Load property details
 * @param {string} propertyId - Property ID
 */
async function loadPropertyDetails(propertyId) {
    try {
        // Get property document
        const propertyDoc = await getDoc(doc(db, "properties", propertyId));
        
        if (!propertyDoc.exists()) {
            showError('Property not found');
            return;
        }
        
        const property = propertyDoc.data();
        property.id = propertyDoc.id;
        
        // Format price
        if (property.price) {
            property.priceFormatted = `$${property.price.toLocaleString()}`;
        }
        
        // Update UI with property details
        updatePropertyUI(property);
        
    } catch (error) {
        console.error('Error loading property details:', error);
        showError('Failed to load property details');
    }
}

/**
 * Update UI with property details
 * @param {Object} property - Property data
 */
function updatePropertyUI(property) {
    // Set title
    document.title = `${property.title} - عقار`;
    
    // Update main elements
    const elements = {
        mainImage: document.getElementById('propertyMainImage'),
        title: document.querySelector('.property-card__title'),
        location: document.querySelector('.property-card__location'),
        price: document.querySelector('.property-card__price'),
        description: document.querySelector('.property-section:nth-of-type(3)').querySelector('p')
    };
    
    if (elements.mainImage) elements.mainImage.src = property.imageUrl;
    if (elements.title) elements.title.textContent = property.title;
    if (elements.location) {
        const locationIcon = elements.location.querySelector('i');
        elements.location.innerHTML = '';
        elements.location.appendChild(locationIcon);
        elements.location.append(` ${property.location}`);
    }
    if (elements.price) elements.price.textContent = property.priceFormatted;
    
    // Update features
    if (property.features) {
        const features = property.features;
        
        const bedroomsElement = document.querySelector('.property-feature-item:nth-of-type(1)').querySelector('div:nth-of-type(2) div:nth-of-type(2)');
        const bathroomsElement = document.querySelector('.property-feature-item:nth-of-type(2)').querySelector('div:nth-of-type(2) div:nth-of-type(2)');
        const areaElement = document.querySelector('.property-feature-item:nth-of-type(3)').querySelector('div:nth-of-type(2) div:nth-of-type(2)');
        
        if (bedroomsElement) bedroomsElement.textContent = `${features.bedrooms} غرف`;
        if (bathroomsElement) bathroomsElement.textContent = `${features.bathrooms} حمامات`;
        if (areaElement) areaElement.textContent = `${features.area} قدم²`;
    }
    
    // Update description
    if (elements.description && property.description) {
        // Split description into paragraphs
        const paragraphs = property.description.split('\n\n');
        
        if (paragraphs.length > 1) {
            // Replace first paragraph
            elements.description.textContent = paragraphs[0];
            
            // Add additional paragraphs
            const descriptionSection = elements.description.parentElement;
            for (let i = 1; i < paragraphs.length; i++) {
                const p = document.createElement('p');
                p.className = 'mt-2';
                p.textContent = paragraphs[i];
                descriptionSection.appendChild(p);
            }
        } else {
            elements.description.textContent = property.description;
        }
    }
    
    // Add property ID to favorite button
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.dataset.propertyId = property.id;
    }
}

/**
 * Initialize favorite button
 * @param {string} propertyId - Property ID
 */
async function initFavoriteButton(propertyId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;
    
    favoriteBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const heartIcon = this.querySelector('i');
        if (!heartIcon) return;
        
        const userId = auth.currentUser?.uid;
        if (!userId) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            // Check if already favorited
            const userDoc = await getDoc(doc(db, "users", userId));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const favorites = userData.favorites || [];
                
                if (favorites.includes(propertyId)) {
                    // Remove from favorites
                    await removeFromFavorites(propertyId);
                    
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    heartIcon.style.color = '';
                    
                    showToast('تمت إزالة العقار من المفضلة', 'info');
                } else {
                    // Add to favorites
                    await addToFavorites(propertyId);
                    
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    heartIcon.style.color = '#ef4444';
                    
                    showToast('تمت إضافة العقار إلى المفضلة', 'success');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
        }
    });
    
    // Update initial state
    updateFavoriteButtonState(propertyId);
}

/**
 * Update favorite button state
 * @param {string} propertyId - Property ID
 */
async function updateFavoriteButtonState(propertyId) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;
    
    const heartIcon = favoriteBtn.querySelector('i');
    if (!heartIcon) return;
    
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const favorites = userData.favorites || [];
            
            if (favorites.includes(propertyId)) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                heartIcon.style.color = '#ef4444';
            } else {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                heartIcon.style.color = '';
            }
        }
    } catch (error) {
        console.error('Error updating favorite button state:', error);
    }
}

/**
 * Share property
 * @param {string} propertyId - Property ID
 */
function shareProperty(propertyId) {
    const shareUrl = `${window.location.origin}/property-details.html?id=${propertyId}`;
    
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showToast('تم نسخ الرابط إلى الحافظة', 'success');
            })
            .catch(() => {
                // Manual fallback
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                textarea.style.position = 'fixed';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                
                try {
                    document.execCommand('copy');
                    showToast('تم نسخ الرابط إلى الحافظة', 'success');
                } catch (err) {
                    showToast('فشل نسخ الرابط', 'error');
                    console.error('Error copying URL:', err);
                }
                
                document.body.removeChild(textarea);
            });
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const container = document.querySelector('.property-details-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="container py-5 text-center">
            <i class="fas fa-exclamation-circle fa-3x" style="color: var(--danger-color);"></i>
            <h2 class="mt-3">خطأ</h2>
            <p>${message}</p>
            <a href="index.html" class="btn btn--primary mt-3">العودة إلى الصفحة الرئيسية</a>
        </div>
    `;
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'info') {
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
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        
        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}