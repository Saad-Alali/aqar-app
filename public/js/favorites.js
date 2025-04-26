import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

domReady(() => {
    const favoritesPage = document.querySelector('.favorites-container');
    if (favoritesPage) {
        initFavoritesPage();
    } else {
        initFavoriteButtons();
    }
});

async function initFavoritesPage() {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        await loadFavorites();
        
        const favoriteTabs = document.querySelectorAll('.favorites-tab');
        favoriteTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                favoriteTabs.forEach(t => t.classList.remove('favorites-tab--active'));
                this.classList.add('favorites-tab--active');
                
                const category = this.textContent.trim();
                filterFavorites(category);
            });
        });
    } catch (error) {
        console.error("Error initializing favorites page:", error);
    }
}

async function loadFavorites() {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) return;
    
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const favorites = userData.favorites || [];
            
            const favoritesContainer = document.getElementById('favoritesWithItems');
            const emptyFavorites = document.getElementById('favoritesEmpty');
            
            if (favoritesContainer && emptyFavorites) {
                if (favorites.length === 0) {
                    favoritesContainer.style.display = 'none';
                    emptyFavorites.style.display = 'block';
                    return;
                }
                
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
    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

function createFavoriteItem(property) {
    const itemElement = document.createElement('div');
    itemElement.className = 'favorite-property swipe-item';
    itemElement.dataset.id = property.id;
    itemElement.dataset.type = property.propertyType;
    
    const transactionType = property.transactionType || (property.price > 500000 ? 'للبيع' : 'للإيجار');
    itemElement.dataset.transaction = transactionType;
    
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
                    await removeFromFavorites(propertyId);
                    
                    propertyItem.style.transition = 'all 0.3s ease';
                    propertyItem.style.opacity = '0';
                    propertyItem.style.height = '0';
                    propertyItem.style.marginBottom = '0';
                    propertyItem.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        propertyItem.remove();
                        
                        const remainingProperties = document.querySelectorAll('.favorite-property');
                        if (remainingProperties.length === 0) {
                            const favoritesContainer = document.getElementById('favoritesWithItems');
                            const emptyFavorites = document.getElementById('favoritesEmpty');
                            
                            if (favoritesContainer && emptyFavorites) {
                                favoritesContainer.style.display = 'none';
                                emptyFavorites.style.display = 'block';
                            }
                        }
                    }, 300);
                } catch (error) {
                    console.error("Error removing from favorites:", error);
                }
            }
        });
    });
}

function filterFavorites(category) {
    const favorites = document.querySelectorAll('.favorite-property');
    const favoritesContainer = document.getElementById('favoritesWithItems');
    const emptyFavorites = document.getElementById('favoritesEmpty');
    
    if (category === 'الكل') {
        favorites.forEach(fav => {
            fav.style.display = 'block';
        });
    } else {
        let found = false;
        favorites.forEach(fav => {
            const type = fav.dataset.type;
            const transaction = fav.dataset.transaction;
            
            if ((category === 'للبيع' && transaction === 'للبيع') || 
                (category === 'للإيجار' && transaction === 'للإيجار') ||
                (category === 'شقق' && type === 'apartment') ||
                (category === 'فلل' && type === 'villa') ||
                (category === 'منازل' && type === 'house') ||
                (category === 'مباني تجارية' && type === 'commercial')) {
                fav.style.display = 'block';
                found = true;
            } else {
                fav.style.display = 'none';
            }
        });
        
        if (favoritesContainer && emptyFavorites) {
            if (!found) {
                favoritesContainer.style.display = 'none';
                emptyFavorites.style.display = 'block';
            } else {
                favoritesContainer.style.display = 'block';
                emptyFavorites.style.display = 'none';
            }
        }
    }
}

function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
    
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const propertyId = this.dataset.propertyId;
            if (!propertyId) return;
            
            const userId = Aqar.Auth.getCurrentUserId();
            if (!userId) {
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const favorites = userData.favorites || [];
                    
                    const heartIcon = this.querySelector('i');
                    
                    if (favorites.includes(propertyId)) {
                        await removeFromFavorites(propertyId);
                        
                        if (heartIcon) {
                            heartIcon.classList.remove('fas');
                            heartIcon.classList.add('far');
                            heartIcon.style.color = '';
                        }
                        
                        showToast('تمت إزالة العقار من المفضلة', 'info');
                    } else {
                        await addToFavorites(propertyId);
                        
                        if (heartIcon) {
                            heartIcon.classList.remove('far');
                            heartIcon.classList.add('fas');
                            heartIcon.style.color = '#ef4444';
                        }
                        
                        showToast('تمت إضافة العقار إلى المفضلة', 'success');
                    }
                }
            } catch (error) {
                console.error("Error toggling favorite:", error);
                showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
            }
        });
    });
    
    updateFavoriteButtonsState();
}

async function updateFavoriteButtonsState() {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) return;
    
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const favorites = userData.favorites || [];
            
            const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
            
            favoriteButtons.forEach(btn => {
                const propertyId = btn.dataset.propertyId;
                if (!propertyId) return;
                
                const heartIcon = btn.querySelector('i');
                if (!heartIcon) return;
                
                if (favorites.includes(propertyId)) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    heartIcon.style.color = '#ef4444';
                } else {
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    heartIcon.style.color = '';
                }
            });
        }
    } catch (error) {
        console.error("Error updating favorite buttons state:", error);
    }
}

async function addToFavorites(propertyId) {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) return;
    
    try {
        await updateDoc(doc(db, "users", userId), {
            favorites: arrayUnion(propertyId),
            updatedAt: new Date()
        });
        
        return true;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
    }
}

async function removeFromFavorites(propertyId) {
    const userId = Aqar.Auth.getCurrentUserId();
    if (!userId) return;
    
    try {
        await updateDoc(doc(db, "users", userId), {
            favorites: arrayRemove(propertyId),
            updatedAt: new Date()
        });
        
        return true;
    } catch (error) {
        console.error("Error removing from favorites:", error);
        throw error;
    }
}

export { addToFavorites, removeFromFavorites };