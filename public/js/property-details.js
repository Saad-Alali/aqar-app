import { initializeJsonService, dataCache } from './json-service.js';

const localCache = {
  properties: null,
  timestamp: null
};

export async function getAllProperties() {
  try {
    await initializeJsonService();
    
    localCache.properties = dataCache.properties;
    localCache.timestamp = Date.now();
    
    return dataCache.properties;
  } catch (error) {
    console.error("Error getting properties:", error);
    return getSampleProperties();
  }
}

export async function getProperty(propertyId) {
  try {
    await initializeJsonService();
    
    const property = dataCache.properties.find(p => p.id === propertyId);
    
    if (!property) {
      throw new Error("Property not found");
    }
    
    return property;
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
}

export async function getPropertiesByIds(propertyIds) {
  try {
    if (!propertyIds || propertyIds.length === 0) {
      return [];
    }
    
    await initializeJsonService();
    
    const properties = dataCache.properties.filter(p => propertyIds.includes(p.id));
    
    return properties;
  } catch (error) {
    console.error("Error getting properties by IDs:", error);
    return [];
  }
}

export async function filterProperties(filters) {
  try {
    const allProperties = await getAllProperties();
    
    let filtered = [...allProperties];
    
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }
    
    if (filters.transactionType) {
      filtered = filtered.filter(p => p.transactionType === filters.transactionType);
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.minBedrooms) {
      filtered = filtered.filter(p => p.features && p.features.bedrooms >= filters.minBedrooms);
    }
    
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date-newest':
          filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
          break;
        case 'date-oldest':
          filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
          break;
      }
    }
    
    return filtered;
  } catch (error) {
    console.error("Error filtering properties:", error);
    return getSampleProperties();
  }
}

export async function searchProperties(keyword) {
  if (!keyword) return getAllProperties();
  
  try {
    const allProperties = await getAllProperties();
    
    const normalizedKeyword = keyword.toLowerCase();
    
    return allProperties.filter(property => {
      const searchableText = `${property.title} ${property.location} ${property.description}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    return getSampleProperties();
  }
}

function getSampleProperties() {
  return [
    {
      id: 'prop1',
      title: "شقة حديثة",
      location: "وسط المدينة",
      price: 350000,
      priceFormatted: "$350,000",
      propertyType: "apartment",
      transactionType: "للبيع",
      features: {
        bedrooms: 2,
        bathrooms: 2,
        area: 1200
      },
      description: "شقة حديثة في قلب المدينة مع إطلالات رائعة وسهولة الوصول إلى جميع المرافق",
      imageUrl: "img/placeholder.jpg"
    }
  ];
}