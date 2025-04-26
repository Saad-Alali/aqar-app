import { getCurrentUser, setCurrentUser, showToast, showLoginModal } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    initFavoriteButtons();
    
    const favoritesPage = document.querySelector('.favorites-container');
    if (favoritesPage) {
        initFavoritesPage();
    }
});

function initFavoritesPage() {
    const user = getCurrentUser();
    
    if (!user) {
        showAuthOverlay();
        return;
    }
    
    loadFavorites();
    
    const favoriteTabs = document.querySelectorAll('.favorites-tab');
    favoriteTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            favoriteTabs.forEach(t => t.classList.remove('favorites-tab--active'));
            this.classList.add('favorites-tab--active');
            
            const category = this.textContent.trim();
            filterFavorites(category);
        });
    });
}

function showAuthOverlay() {
    const authOverlay = document.getElementById('authOverlay');
    const content = document.querySelector('.app-content');
    
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    
    if (content) {
        content.classList.add('blurred-content');
    }
}

function loadFavorites() {
    const user = getCurrentUser();
    if (!user) return;
    
    const favorites = user.favorites || [];
    const favoritesContainer = document.getElementById('favoritesWithItems');
    const emptyFavorites = document.getElementById('favoritesEmpty');
    
    if (!favoritesContainer || !emptyFavorites) return;
    
    if (favorites.length === 0) {
        favoritesContainer.style.display = 'none';
        emptyFavorites.style.display = 'block';
        return;
    }
    
    favoritesContainer.style.display = 'block';
    emptyFavorites.style.display = 'none';
    
    // Display favorite items
    displayFavoriteItems(favorites, favoritesContainer);
}

function displayFavoriteItems(favorites, container) {
    // Clear container
    container.innerHTML = '';
    
    // Sample properties data (for demo purposes)
    const sampleProperties = [
        {
            id: 'prop1',
            title: "شقة حديثة",
            location: "وسط المدينة",
            price: 350000,
            priceFormatted: "$350,000",
            features: {
                bedrooms: 2,
                bathrooms: 2,
                area: 1200
            },
            imageUrl: "img/placeholder.jpg"
        },
        {
            id: 'prop2',
            title: "فيلا فاخرة على الواجهة البحرية",
            location: "الواجهة البحرية، شارع المحيط",
            price: 1250000,
            priceFormatted: "$1,250,000",
            features: {
                bedrooms: 5,
                bathrooms: 4,
                area: 3500
            },
            imageUrl: "img/placeholder.jpg"
        },
        {
            id: 'prop3',
            title: "منزل عائلي واسع",
            location: "ضواحي، الوادي الأخضر",
            price: 580000,
            priceFormatted: "$580,000",
            features: {
                bedrooms: 4,
                bathrooms: 3,
                area: 2400
            },
            imageUrl: "img/placeholder.jpg"
        }
    ];
    
    // Filter properties based on favorites
    const favoriteProperties = sampleProperties.filter(prop => favorites.includes(prop.id));
    
    // Create and append favorite items
    favoriteProperties.forEach(property => {
        const favoriteItem = createFavoriteItem(property);
        container.appendChild(favoriteItem);
    });
    
    // If no properties were found for favorites
    if (favoriteProperties.length === 0) {
        container.style.display = 'none';
        document.getElementById('favoritesEmpty').style.display = 'block';
    }
    
    // Attach event listeners to delete buttons
    attachDeleteButtonListeners();
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
            <a href="#" class="favorite-property__action favorite-property__action--delete" title="إزالة من المفضلة" data-id="${property.id}">
                <i class="fas fa-trash-alt"></i>
            </a>
            <a href="#" class="favorite-property__action" title="مشاركة">
                <i class="fas fa-share-alt"></i>
            </a>
        </div>
    `;
    
    return itemElement;
}

function attachDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll('.favorite-property__action--delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const propertyId = this.dataset.id;
            const propertyItem = this.closest('.favorite-property');
            
            if (propertyId && propertyItem) {
                removeFromFavorites(propertyId);
                
                propertyItem.style.transition = 'all 0.3s ease';
                propertyItem.style.opacity = '0';
                propertyItem.style.height = '0';
                propertyItem.style.marginBottom = '0';
                propertyItem.style.overflow = 'hidden';
                
                setTimeout(() => {
                    propertyItem.remove();
                    
                    const remainingProperties = document.querySelectorAll('.favorite-property');
                    if (remainingProperties.length === 0) {
                        document.getElementById('favoritesWithItems').style.display = 'none';
                        document.getElementById('favoritesEmpty').style.display = 'block';
                    }
                }, 300);
                
                showToast('تمت إزالة العقار من المفضلة', 'info');
            }
        });
    });
}

function filterFavorites(category) {
    // Sample implementation for filtering favorites
    if (category === 'شقق') {
        document.getElementById('favoritesWithItems').style.display = 'none';
        document.getElementById('favoritesEmpty').style.display = 'block';
    } else {
        const user = getCurrentUser();
        if (user && user.favorites && user.favorites.length > 0) {
            document.getElementById('favoritesWithItems').style.display = 'block';
            document.getElementById('favoritesEmpty').style.display = 'none';
        }
    }
}

function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.property-card__favorite-btn, #favoriteBtn');
    
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const propertyId = this.dataset.propertyId;
            if (!propertyId) return;
            
            const user = getCurrentUser();
            if (!user) {
                showLoginModal('يجب تسجيل الدخول أولاً لإضافة العقار إلى المفضلة');
                return;
            }
            
            const favorites = user.favorites || [];
            const heartIcon = this.querySelector('i');
            
            if (favorites.includes(propertyId)) {
                // Remove from favorites
                removeFromFavorites(propertyId);
                
                if (heartIcon) {
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    heartIcon.style.color = '';
                }
                
                showToast('تمت إزالة العقار من المفضلة', 'info');
            } else {
                // Add to favorites
                addToFavorites(propertyId);
                
                if (heartIcon) {
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    heartIcon.style.color = '#ef4444';
                }
                
                showToast('تمت إضافة العقار إلى المفضلة', 'success');
            }
        });
    });
    
    updateFavoriteButtonsState();
}

function updateFavoriteButtonsState() {
    const user = getCurrentUser();
    if (!user) return;
    
    const favorites = user.favorites || [];
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

function addToFavorites(propertyId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const favorites = user.favorites || [];
    
    if (!favorites.includes(propertyId)) {
        favorites.push(propertyId);
        
        user.favorites = favorites;
        setCurrentUser(user);
        
        updateFavoriteButtonsState();
        return true;
    }
    
    return false;
}

function removeFromFavorites(propertyId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    let favorites = user.favorites || [];
    
    favorites = favorites.filter(id => id !== propertyId);
    
    user.favorites = favorites;
    setCurrentUser(user);
    
    updateFavoriteButtonsState();
    return true;
}

export {
    addToFavorites,
    removeFromFavorites,
    showLoginModal
};