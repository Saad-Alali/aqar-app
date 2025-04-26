import { db } from './firebase.js';
import { collection, getDocs, query, where, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

const propertiesState = {
    properties: [],
    filteredProperties: [],
    currentPage: 1,
    propertiesPerPage: 6,
    totalPages: 1,
    filters: {
        keyword: '',
        location: '',
        propertyType: '',
        priceRange: ''
    },
    sort: 'default'
};

domReady(() => {
    const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
    if (!propertiesGrid) return;
    
    initProperties();
    
    const searchForm = Aqar.DOM.getById('searchForm');
    if (searchForm) {
        initSearchForm(searchForm);
    }
    
    const sortDropdown = Aqar.DOM.getById('sortProperties');
    if (sortDropdown) {
        initSortDropdown(sortDropdown);
    }
    
    const pagination = Aqar.DOM.getById('pagination');
    if (pagination) {
        initPagination(pagination);
    }
});

async function initProperties() {
    try {
        const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-3">Loading properties...</p></div>';
        
        const properties = await fetchProperties();
        
        propertiesState.properties = properties;
        propertiesState.filteredProperties = [...properties];
        propertiesState.totalPages = Math.ceil(properties.length / propertiesState.propertiesPerPage);
        
        renderProperties();
        renderPagination();
        
    } catch (error) {
        console.error('Error loading properties:', error);
        const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-exclamation-circle fa-2x text-danger"></i><p class="mt-3">Failed to load properties. Please try again later.</p></div>';
    }
}

async function fetchProperties() {
    try {
        const propertiesCollection = collection(db, "properties");
        const propertiesSnapshot = await getDocs(propertiesCollection);
        
        const properties = [];
        propertiesSnapshot.forEach(doc => {
            const property = doc.data();
            property.id = doc.id;
            
            if (property.price) {
                property.priceFormatted = `$${property.price.toLocaleString()}`;
            }
            
            properties.push(property);
        });
        
        return properties;
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
    }
}

async function fetchPropertyById(propertyId) {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        const propertySnap = await getDoc(propertyRef);
        
        if (propertySnap.exists()) {
            const property = propertySnap.data();
            property.id = propertySnap.id;
            
            if (property.price) {
                property.priceFormatted = `$${property.price.toLocaleString()}`;
            }
            
            return property;
        } else {
            console.log("No such property!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching property:", error);
        throw error;
    }
}

async function addProperty(propertyData) {
    try {
        const docRef = await addDoc(collection(db, "properties"), {
            ...propertyData,
            dateAdded: new Date().toISOString().split('T')[0]
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding property:", error);
        throw error;
    }
}

async function updateProperty(propertyId, propertyData) {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        await updateDoc(propertyRef, propertyData);
        return true;
    } catch (error) {
        console.error("Error updating property:", error);
        throw error;
    }
}

async function deleteProperty(propertyId) {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        await deleteDoc(propertyRef);
        return true;
    } catch (error) {
        console.error("Error deleting property:", error);
        throw error;
    }
}

async function searchProperties(filters) {
    try {
        let q = collection(db, "properties");
        
        if (filters.propertyType) {
            q = query(q, where("propertyType", "==", filters.propertyType));
        }
        
        if (filters.location) {
            q = query(q, where("location", "array-contains", filters.location));
        }
        
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            if (min > 0) q = query(q, where("price", ">=", min));
            if (max > 0) q = query(q, where("price", "<=", max));
        }
        
        const querySnapshot = await getDocs(q);
        
        const properties = [];
        querySnapshot.forEach(doc => {
            const property = doc.data();
            property.id = doc.id;
            
            if (property.price) {
                property.priceFormatted = `$${property.price.toLocaleString()}`;
            }
            
            properties.push(property);
        });
        
        return properties;
    } catch (error) {
        console.error("Error searching properties:", error);
        throw error;
    }
}

function renderProperties() {
    const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
    if (!propertiesGrid) return;
    
    const startIndex = (propertiesState.currentPage - 1) * propertiesState.propertiesPerPage;
    const endIndex = startIndex + propertiesState.propertiesPerPage;
    const currentProperties = propertiesState.filteredProperties.slice(startIndex, endIndex);
    
    propertiesGrid.innerHTML = '';
    
    if (currentProperties.length === 0) {
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-search fa-2x"></i><p class="mt-3">No properties found matching your criteria.</p></div>';
        return;
    }
    
    currentProperties.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertiesGrid.appendChild(propertyCard);
    });
}

function createPropertyCard(property) {
    const cardElement = document.createElement('div');
    cardElement.className = 'property-card';
    
    cardElement.innerHTML = `
        <div class="property-card__image">
            <img src="${property.imageUrl}" alt="${property.title}" class="property-card__img">
        </div>
        <div class="property-card__content">
            <h3 class="property-card__title">${property.title}</h3>
            <div class="property-card__location">
                <i class="fas fa-map-marker-alt property-card__location-icon"></i>
                ${property.location}
            </div>
            <div class="property-card__price">${property.priceFormatted}</div>
            <div class="property-card__features">
                <div class="property-card__feature">
                    <i class="fas fa-bed property-card__feature-icon"></i> ${property.features.bedrooms} Bed${property.features.bedrooms !== 1 ? 's' : ''}
                </div>
                <div class="property-card__feature">
                    <i class="fas fa-bath property-card__feature-icon"></i> ${property.features.bathrooms} Bath${property.features.bathrooms !== 1 ? 's' : ''}
                </div>
                <div class="property-card__feature">
                    <i class="fas fa-ruler-combined property-card__feature-icon"></i> ${property.features.area} sqft
                </div>
            </div>
            <p class="property-card__description">
                ${property.description}
            </p>
            <a href="property-details.html?id=${property.id}" class="btn btn--primary property-card__btn">View Details</a>
        </div>
    `;
    
    return cardElement;
}

function initSearchForm(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const keyword = Aqar.DOM.getById('keyword').value.trim().toLowerCase();
        const location = Aqar.DOM.getById('location').value;
        const propertyType = Aqar.DOM.getById('propertyType').value;
        const priceRange = Aqar.DOM.getById('priceRange').value;
        
        propertiesState.filters = {
            keyword,
            location,
            propertyType,
            priceRange
        };
        
        try {
            let properties;
            
            if (keyword || location || propertyType || priceRange) {
                properties = await searchProperties(propertiesState.filters);
            } else {
                properties = await fetchProperties();
            }
            
            propertiesState.filteredProperties = properties;
            
            if (keyword) {
                propertiesState.filteredProperties = propertiesState.filteredProperties.filter(property => {
                    return property.title.toLowerCase().includes(keyword) ||
                           property.description.toLowerCase().includes(keyword) ||
                           property.location.toLowerCase().includes(keyword);
                });
            }
            
            sortProperties();
            
            propertiesState.currentPage = 1;
            propertiesState.totalPages = Math.ceil(propertiesState.filteredProperties.length / propertiesState.propertiesPerPage);
            
            renderProperties();
            renderPagination();
        } catch (error) {
            console.error("Error during search:", error);
        }
    });
}

function initSortDropdown(select) {
    select.addEventListener('change', () => {
        propertiesState.sort = select.value;
        
        sortProperties();
        
        renderProperties();
    });
}

function sortProperties() {
    switch (propertiesState.sort) {
        case 'price-asc':
            propertiesState.filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            propertiesState.filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'date-newest':
            propertiesState.filteredProperties.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'date-oldest':
            propertiesState.filteredProperties.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        default:
            propertiesState.filteredProperties.sort((a, b) => a.id.localeCompare(b.id));
    }
}

function initPagination(paginationElement) {
    paginationElement.addEventListener('click', (e) => {
        e.preventDefault();
        
        const pageLink = e.target.closest('.pagination__link');
        if (!pageLink) return;
        
        const pageText = pageLink.textContent.trim();
        
        if (pageText === '→' || pageLink.querySelector('.fa-chevron-right')) {
            if (propertiesState.currentPage < propertiesState.totalPages) {
                propertiesState.currentPage++;
            }
        } else if (pageText === '←' || pageLink.querySelector('.fa-chevron-left')) {
            if (propertiesState.currentPage > 1) {
                propertiesState.currentPage--;
            }
        } else {
            propertiesState.currentPage = parseInt(pageText);
        }
        
        renderProperties();
        renderPagination();
        
        const propertiesSection = document.querySelector('.properties');
        if (propertiesSection) {
            window.scrollTo({
                top: propertiesSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
}

function renderPagination() {
    const paginationElement = Aqar.DOM.getById('pagination');
    if (!paginationElement) return;
    
    paginationElement.innerHTML = '';
    
    if (propertiesState.filteredProperties.length === 0 || propertiesState.totalPages <= 1) {
        paginationElement.classList.add('hidden');
        return;
    }
    
    paginationElement.classList.remove('hidden');
    
    if (propertiesState.currentPage > 1) {
        const prevItem = document.createElement('li');
        prevItem.className = 'pagination__item';
        prevItem.innerHTML = `<a href="#" class="pagination__link"><i class="fas fa-chevron-left"></i></a>`;
        paginationElement.appendChild(prevItem);
    }
    
    let startPage = Math.max(1, propertiesState.currentPage - 2);
    let endPage = Math.min(propertiesState.totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'pagination__item';
        
        const activeClass = i === propertiesState.currentPage ? 'pagination__link--active' : '';
        pageItem.innerHTML = `<a href="#" class="pagination__link ${activeClass}">${i}</a>`;
        
        paginationElement.appendChild(pageItem);
    }
    
    if (propertiesState.currentPage < propertiesState.totalPages) {
        const nextItem = document.createElement('li');
        nextItem.className = 'pagination__item';
        nextItem.innerHTML = `<a href="#" class="pagination__link"><i class="fas fa-chevron-right"></i></a>`;
        paginationElement.appendChild(nextItem);
    }
}

export { fetchProperties, fetchPropertyById, addProperty, updateProperty, deleteProperty, searchProperties };