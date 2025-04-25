/**
 * Aqar - Real Estate Website
 * Properties JavaScript
 */

// Properties state
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

/**
 * Initialize Properties functionality
 */
domReady(() => {
    // Check if on properties page
    const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
    if (!propertiesGrid) return;
    
    // Initialize properties
    initProperties();
    
    // Initialize search form
    const searchForm = Aqar.DOM.getById('searchForm');
    if (searchForm) {
        initSearchForm(searchForm);
    }
    
    // Initialize sort dropdown
    const sortDropdown = Aqar.DOM.getById('sortProperties');
    if (sortDropdown) {
        initSortDropdown(sortDropdown);
    }
    
    // Initialize pagination
    const pagination = Aqar.DOM.getById('pagination');
    if (pagination) {
        initPagination(pagination);
    }
});

/**
 * Initialize Properties
 */
async function initProperties() {
    try {
        // Show loading
        const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-3">Loading properties...</p></div>';
        
        // Fetch properties data
        const properties = await fetchProperties();
        
        // Update state
        propertiesState.properties = properties;
        propertiesState.filteredProperties = [...properties];
        propertiesState.totalPages = Math.ceil(properties.length / propertiesState.propertiesPerPage);
        
        // Render properties
        renderProperties();
        renderPagination();
        
    } catch (error) {
        console.error('Error loading properties:', error);
        const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-exclamation-circle fa-2x text-danger"></i><p class="mt-3">Failed to load properties. Please try again later.</p></div>';
    }
}

/**
 * Simulate fetching properties from API
 * @returns {Promise<Array>} - Promise resolving to properties array
 */
async function fetchProperties() {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Sample properties data
            const properties = [
                {
                    id: 'prop_1',
                    title: 'Modern Apartment',
                    location: 'Downtown, City Center',
                    price: 350000,
                    priceFormatted: '$350,000',
                    propertyType: 'apartment',
                    features: {
                        bedrooms: 2,
                        bathrooms: 2,
                        area: 1200
                    },
                    description: 'A beautiful modern apartment in the heart of the city with stunning views and easy access to amenities.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-08-15'
                },
                {
                    id: 'prop_2',
                    title: 'Luxury Villa',
                    location: 'Beachfront, Ocean Drive',
                    price: 1250000,
                    priceFormatted: '$1,250,000',
                    propertyType: 'villa',
                    features: {
                        bedrooms: 5,
                        bathrooms: 4,
                        area: 3500
                    },
                    description: 'Stunning beachfront villa with panoramic ocean views, private pool, and luxury finishes throughout.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-07-22'
                },
                {
                    id: 'prop_3',
                    title: 'Family Home',
                    location: 'Suburban, Green Valley',
                    price: 580000,
                    priceFormatted: '$580,000',
                    propertyType: 'house',
                    features: {
                        bedrooms: 4,
                        bathrooms: 3,
                        area: 2400
                    },
                    description: 'Spacious family home in a quiet neighborhood with large backyard, modern kitchen, and close to schools.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-08-01'
                },
                {
                    id: 'prop_4',
                    title: 'Penthouse Suite',
                    location: 'Downtown, Skyline Tower',
                    price: 950000,
                    priceFormatted: '$950,000',
                    propertyType: 'apartment',
                    features: {
                        bedrooms: 3,
                        bathrooms: 3,
                        area: 2100
                    },
                    description: 'Stunning penthouse with panoramic city views, private terrace, and high-end finishes throughout.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-08-10'
                },
                {
                    id: 'prop_5',
                    title: 'Waterfront Cottage',
                    location: 'Countryside, Lakeside',
                    price: 420000,
                    priceFormatted: '$420,000',
                    propertyType: 'house',
                    features: {
                        bedrooms: 3,
                        bathrooms: 2,
                        area: 1600
                    },
                    description: 'Charming cottage with direct lake access, private dock, and beautiful natural surroundings.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-07-05'
                },
                {
                    id: 'prop_6',
                    title: 'City Studio',
                    location: 'Downtown, Arts District',
                    price: 210000,
                    priceFormatted: '$210,000',
                    propertyType: 'apartment',
                    features: {
                        bedrooms: 1,
                        bathrooms: 1,
                        area: 650
                    },
                    description: 'Cozy studio in the vibrant arts district, perfect for young professionals or as an investment property.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-08-18'
                },
                {
                    id: 'prop_7',
                    title: 'Commercial Space',
                    location: 'Downtown, Business Center',
                    price: 780000,
                    priceFormatted: '$780,000',
                    propertyType: 'commercial',
                    features: {
                        bedrooms: 0,
                        bathrooms: 2,
                        area: 2800
                    },
                    description: 'Prime commercial space in the business district, perfect for office or retail with high foot traffic.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-06-30'
                },
                {
                    id: 'prop_8',
                    title: 'Mountain Retreat',
                    location: 'Countryside, Alpine Heights',
                    price: 890000,
                    priceFormatted: '$890,000',
                    propertyType: 'house',
                    features: {
                        bedrooms: 4,
                        bathrooms: 3,
                        area: 2900
                    },
                    description: 'Beautiful mountain home with stunning views, wrap-around deck, and spacious interiors.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-07-15'
                },
                {
                    id: 'prop_9',
                    title: 'Suburban Townhouse',
                    location: 'Suburban, Maple Drive',
                    price: 320000,
                    priceFormatted: '$320,000',
                    propertyType: 'house',
                    features: {
                        bedrooms: 3,
                        bathrooms: 2,
                        area: 1800
                    },
                    description: 'Modern townhouse in a family-friendly community with park, pool, and walking trails.',
                    imageUrl: 'img/placeholder.jpg',
                    dateAdded: '2024-08-05'
                }
            ];
            
            resolve(properties);
        }, 1000);
    });
}

/**
 * Render properties to grid
 */
function renderProperties() {
    const propertiesGrid = Aqar.DOM.getById('propertiesGrid');
    if (!propertiesGrid) return;
    
    // Get current page properties
    const startIndex = (propertiesState.currentPage - 1) * propertiesState.propertiesPerPage;
    const endIndex = startIndex + propertiesState.propertiesPerPage;
    const currentProperties = propertiesState.filteredProperties.slice(startIndex, endIndex);
    
    // Clear grid
    propertiesGrid.innerHTML = '';
    
    if (currentProperties.length === 0) {
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-search fa-2x"></i><p class="mt-3">No properties found matching your criteria.</p></div>';
        return;
    }
    
    // Add property cards to grid
    currentProperties.forEach(property => {
        const propertyCard = createPropertyCard(property);
        propertiesGrid.appendChild(propertyCard);
    });
}

/**
 * Create property card element
 * @param {Object} property - Property data
 * @returns {HTMLElement} - Property card element
 */
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
            <a href="#" class="btn btn--primary property-card__btn" data-property-id="${property.id}">View Details</a>
        </div>
    `;
    
    return cardElement;
}

/**
 * Initialize Search Form
 * @param {HTMLFormElement} form - Search form element
 */
function initSearchForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get filter values
        const keyword = Aqar.DOM.getById('keyword').value.trim().toLowerCase();
        const location = Aqar.DOM.getById('location').value;
        const propertyType = Aqar.DOM.getById('propertyType').value;
        const priceRange = Aqar.DOM.getById('priceRange').value;
        
        // Update state
        propertiesState.filters = {
            keyword,
            location,
            propertyType,
            priceRange
        };
        
        // Apply filters
        filterProperties();
        
        // Reset to first page
        propertiesState.currentPage = 1;
        
        // Render updated properties
        renderProperties();
        renderPagination();
    });
}

/**
 * Filter properties based on search criteria
 */
function filterProperties() {
    const { keyword, location, propertyType, priceRange } = propertiesState.filters;
    
    // Filter properties
    propertiesState.filteredProperties = propertiesState.properties.filter(property => {
        // Keyword filter (title, description, location)
        const keywordMatch = !keyword || 
            property.title.toLowerCase().includes(keyword) ||
            property.description.toLowerCase().includes(keyword) ||
            property.location.toLowerCase().includes(keyword);
        
        // Location filter
        const locationMatch = !location || property.location.toLowerCase().includes(location.toLowerCase());
        
        // Property type filter
        const typeMatch = !propertyType || property.propertyType === propertyType;
        
        // Price range filter
        let priceMatch = true;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            if (min && max) {
                priceMatch = property.price >= parseInt(min) && property.price <= parseInt(max);
            } else if (min && min.endsWith('+')) {
                priceMatch = property.price >= parseInt(min);
            }
        }
        
        return keywordMatch && locationMatch && typeMatch && priceMatch;
    });
    
    // Apply sorting
    sortProperties();
    
    // Update total pages
    propertiesState.totalPages = Math.ceil(propertiesState.filteredProperties.length / propertiesState.propertiesPerPage);
}

/**
 * Initialize Sort Dropdown
 * @param {HTMLSelectElement} select - Sort dropdown element
 */
function initSortDropdown(select) {
    select.addEventListener('change', () => {
        // Update sort state
        propertiesState.sort = select.value;
        
        // Sort properties
        sortProperties();
        
        // Render updated properties
        renderProperties();
    });
}

/**
 * Sort properties based on selected sort option
 */
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
            // Default sort (by ID)
            propertiesState.filteredProperties.sort((a, b) => a.id.localeCompare(b.id));
    }
}

/**
 * Initialize Pagination
 * @param {HTMLElement} paginationElement - Pagination container element
 */
function initPagination(paginationElement) {
    // Event delegation for pagination clicks
    paginationElement.addEventListener('click', (e) => {
        e.preventDefault();
        
        const pageLink = e.target.closest('.pagination__link');
        if (!pageLink) return;
        
        // Get page number
        const pageText = pageLink.textContent.trim();
        
        if (pageText === '→' || pageLink.querySelector('.fa-chevron-right')) {
            // Next page
            if (propertiesState.currentPage < propertiesState.totalPages) {
                propertiesState.currentPage++;
            }
        } else if (pageText === '←' || pageLink.querySelector('.fa-chevron-left')) {
            // Previous page
            if (propertiesState.currentPage > 1) {
                propertiesState.currentPage--;
            }
        } else {
            // Specific page
            propertiesState.currentPage = parseInt(pageText);
        }
        
        // Render updated properties
        renderProperties();
        renderPagination();
        
        // Scroll to top of properties section
        const propertiesSection = document.querySelector('.properties');
        if (propertiesSection) {
            window.scrollTo({
                top: propertiesSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
}

/**
 * Render pagination links
 */
function renderPagination() {
    const paginationElement = Aqar.DOM.getById('pagination');
    if (!paginationElement) return;
    
    // Clear pagination
    paginationElement.innerHTML = '';
    
    // Don't show pagination if no properties or only one page
    if (propertiesState.filteredProperties.length === 0 || propertiesState.totalPages <= 1) {
        paginationElement.classList.add('hidden');
        return;
    }
    
    paginationElement.classList.remove('hidden');
    
    // Add previous button if not on first page
    if (propertiesState.currentPage > 1) {
        const prevItem = document.createElement('li');
        prevItem.className = 'pagination__item';
        prevItem.innerHTML = `<a href="#" class="pagination__link"><i class="fas fa-chevron-left"></i></a>`;
        paginationElement.appendChild(prevItem);
    }
    
    // Determine page range to show
    let startPage = Math.max(1, propertiesState.currentPage - 2);
    let endPage = Math.min(propertiesState.totalPages, startPage + 4);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Add page links
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'pagination__item';
        
        const activeClass = i === propertiesState.currentPage ? 'pagination__link--active' : '';
        pageItem.innerHTML = `<a href="#" class="pagination__link ${activeClass}">${i}</a>`;
        
        paginationElement.appendChild(pageItem);
    }
    
    // Add next button if not on last page
    if (propertiesState.currentPage < propertiesState.totalPages) {
        const nextItem = document.createElement('li');
        nextItem.className = 'pagination__item';
        nextItem.innerHTML = `<a href="#" class="pagination__link"><i class="fas fa-chevron-right"></i></a>`;
        paginationElement.appendChild(nextItem);
    }
}