const sampleProperties = [
    {
      id: 'prop1',
      title: "Modern Apartment",
      location: "Downtown, City Center",
      price: 350000,
      propertyType: "apartment",
      transactionType: "للبيع",
      features: {
        bedrooms: 2,
        bathrooms: 2,
        area: 1200
      },
      description: "A beautiful modern apartment in the heart of the city with stunning views and easy access to amenities.",
      imageUrl: "img/placeholder.jpg",
      dateAdded: "2023-06-15"
    },
    {
      id: 'prop2',
      title: "Luxury Villa",
      location: "Beachfront, Ocean Drive",
      price: 1250000,
      propertyType: "villa",
      transactionType: "للبيع",
      features: {
        bedrooms: 5,
        bathrooms: 4,
        area: 3500
      },
      description: "Stunning beachfront villa with panoramic ocean views, private pool, and luxury finishes throughout.",
      imageUrl: "img/placeholder.jpg",
      dateAdded: "2023-05-20"
    },
    {
      id: 'prop3',
      title: "Family Home",
      location: "Suburban, Green Valley",
      price: 580000,
      propertyType: "house",
      transactionType: "للبيع",
      features: {
        bedrooms: 4,
        bathrooms: 3,
        area: 2400
      },
      description: "Spacious family home in a quiet neighborhood with large backyard, modern kitchen, and close to schools.",
      imageUrl: "img/placeholder.jpg",
      dateAdded: "2023-04-10"
    },
    {
      id: 'prop4',
      title: "City Studio",
      location: "Downtown, Arts District",
      price: 1800,
      propertyType: "apartment",
      transactionType: "للإيجار",
      features: {
        bedrooms: 1,
        bathrooms: 1,
        area: 650
      },
      description: "Cozy studio in the vibrant arts district, perfect for young professionals.",
      imageUrl: "img/placeholder.jpg",
      dateAdded: "2023-06-01"
    }
  ];
  
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
  
  document.addEventListener('DOMContentLoaded', function() {
    const propertiesGrid = document.getElementById('propertiesGrid');
    if (!propertiesGrid) return;
    
    initProperties();
    
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
      initSearchForm(searchForm);
    }
    
    const sortDropdown = document.getElementById('sortProperties');
    if (sortDropdown) {
      initSortDropdown(sortDropdown);
    }
    
    const pagination = document.getElementById('pagination');
    if (pagination) {
      initPagination(pagination);
    }
  });
  
  async function initProperties() {
    try {
      const propertiesGrid = document.getElementById('propertiesGrid');
      if (!propertiesGrid) return;
      
      propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-3">جاري تحميل العقارات...</p></div>';
      
      const properties = sampleProperties.map(property => {
        return {
          ...property,
          priceFormatted: `$${property.price.toLocaleString()}`
        };
      });
      
      propertiesState.properties = properties;
      propertiesState.filteredProperties = [...properties];
      propertiesState.totalPages = Math.ceil(properties.length / propertiesState.propertiesPerPage);
      
      setTimeout(() => {
        renderProperties();
        renderPagination();
      }, 500);
      
    } catch (error) {
      console.error('Error loading properties:', error);
      const propertiesGrid = document.getElementById('propertiesGrid');
      if (propertiesGrid) {
        propertiesGrid.innerHTML = '<div class="text-center py-5"><i class="fas fa-exclamation-circle fa-2x text-danger"></i><p class="mt-3">Failed to load properties. Please try again later.</p></div>';
      }
    }
  }
  
  function renderProperties() {
    const propertiesGrid = document.getElementById('propertiesGrid');
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const keyword = document.getElementById('keyword')?.value.trim().toLowerCase() || '';
      const location = document.getElementById('location')?.value || '';
      const propertyType = document.getElementById('propertyType')?.value || '';
      const priceRange = document.getElementById('priceRange')?.value || '';
      
      propertiesState.filters = {
        keyword,
        location,
        propertyType,
        priceRange
      };
      
      filterProperties();
    });
  }
  
  function filterProperties() {
    const { keyword, location, propertyType, priceRange } = propertiesState.filters;
    
    let filtered = [...propertiesState.properties];
    
    if (keyword) {
      filtered = filtered.filter(property => {
        return property.title.toLowerCase().includes(keyword) ||
               property.description.toLowerCase().includes(keyword) ||
               property.location.toLowerCase().includes(keyword);
      });
    }
    
    if (location) {
      filtered = filtered.filter(property => {
        return property.location.includes(location);
      });
    }
    
    if (propertyType) {
      filtered = filtered.filter(property => {
        return property.propertyType === propertyType;
      });
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      
      filtered = filtered.filter(property => {
        if (min && max) {
          return property.price >= min && property.price <= max;
        } else if (min) {
          return property.price >= min;
        } else if (max) {
          return property.price <= max;
        }
        return true;
      });
    }
    
    propertiesState.filteredProperties = filtered;
    propertiesState.currentPage = 1;
    propertiesState.totalPages = Math.ceil(filtered.length / propertiesState.propertiesPerPage);
    
    sortProperties();
    
    renderProperties();
    renderPagination();
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
    const paginationElement = document.getElementById('pagination');
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
  
  async function fetchProperties() {
    return sampleProperties.map(property => ({
      ...property,
      priceFormatted: `$${property.price.toLocaleString()}`
    }));
  }
  
  async function fetchPropertyById(propertyId) {
    const property = sampleProperties.find(p => p.id === propertyId);
    
    if (property) {
      return {
        ...property,
        priceFormatted: `$${property.price.toLocaleString()}`
      };
    }
    
    return null;
  }
  
  async function searchProperties(filters) {
    return filterProperties();
  }
  
  export {
    fetchProperties,
    fetchPropertyById,
    searchProperties
  };