// public/js/property-service.js - Enhanced with fallback to local data

// In-memory cache for offline support
const localCache = {
  properties: null,
  timestamp: null
};

// Sample data for fallback when offline
const sampleProperties = [
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
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  },
  {
    id: 'prop2',
    title: "فيلا فاخرة",
    location: "الواجهة البحرية",
    price: 1250000,
    priceFormatted: "$1,250,000",
    propertyType: "villa",
    transactionType: "للبيع",
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 3500
    },
    description: "فيلا فاخرة مع إطلالات بانورامية على البحر وحمام سباحة خاص",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  },
  {
    id: 'prop3',
    title: "منزل عائلي",
    location: "الضواحي",
    price: 580000,
    priceFormatted: "$580,000",
    propertyType: "house",
    transactionType: "للبيع",
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2400
    },
    description: "منزل عائلي واسع في حي هادئ مع حديقة كبيرة ومطبخ حديث وقريب من المدارس",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  }
];

export async function getAllProperties() {
  try {
    // Try to get from Firebase first
    if (window.firebaseDb && window.firebaseFirestore) {
      const { collection, getDocs } = window.firebaseFirestore;
      const db = window.firebaseDb;
      
      try {
        const propertiesRef = collection(db, "properties");
        const propertiesSnapshot = await getDocs(propertiesRef);
        
        const properties = [];
        propertiesSnapshot.forEach(doc => {
          properties.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Update the cache
        localCache.properties = properties;
        localCache.timestamp = Date.now();
        
        return properties;
      } catch (firestoreError) {
        console.warn("Firestore error, using cached or sample data:", firestoreError);
        // Continue to fallback
      }
    }
    
    // Return from cache if available and recent (less than 1 hour old)
    if (localCache.properties && localCache.timestamp && 
        (Date.now() - localCache.timestamp < 3600000)) {
      console.log("Using cached property data");
      return localCache.properties;
    }
    
    // Fallback to sample data if no cache or Firebase
    console.log("Using sample property data");
    return sampleProperties;
  } catch (error) {
    console.error("Error getting properties:", error);
    // Last resort fallback
    return sampleProperties;
  }
}

export async function getProperty(propertyId) {
  try {
    // Try to get from Firebase first
    if (window.firebaseDb && window.firebaseFirestore) {
      const { doc, getDoc } = window.firebaseFirestore;
      const db = window.firebaseDb;
      
      try {
        const propertyRef = doc(db, "properties", propertyId);
        const propertySnapshot = await getDoc(propertyRef);
        
        if (propertySnapshot.exists()) {
          return {
            id: propertySnapshot.id,
            ...propertySnapshot.data()
          };
        }
      } catch (firestoreError) {
        console.warn("Firestore error, falling back to local data:", firestoreError);
        // Continue to fallback
      }
    }
    
    // Look in cache first
    if (localCache.properties) {
      const cachedProperty = localCache.properties.find(p => p.id === propertyId);
      if (cachedProperty) return cachedProperty;
    }
    
    // Fallback to sample data
    const sampleProperty = sampleProperties.find(p => p.id === propertyId);
    if (sampleProperty) return sampleProperty;
    
    throw new Error("Property not found");
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
    
    // Try Firebase first
    if (window.firebaseDb && window.firebaseFirestore) {
      const { doc, getDoc } = window.firebaseFirestore;
      const db = window.firebaseDb;
      
      try {
        const propertiesPromises = propertyIds.map(id => getDoc(doc(db, "properties", id)));
        const propertiesSnapshots = await Promise.all(propertiesPromises);
        
        const properties = propertiesSnapshots
          .filter(snapshot => snapshot.exists())
          .map(snapshot => ({
            id: snapshot.id,
            ...snapshot.data()
          }));
        
        if (properties.length > 0) {
          return properties;
        }
      } catch (firestoreError) {
        console.warn("Firestore error when getting properties by IDs:", firestoreError);
        // Continue to fallback
      }
    }
    
    // Look in cache
    if (localCache.properties) {
      const properties = localCache.properties.filter(p => propertyIds.includes(p.id));
      if (properties.length > 0) return properties;
    }
    
    // Fallback to sample data
    return sampleProperties.filter(p => propertyIds.includes(p.id));
  } catch (error) {
    console.error("Error getting properties by IDs:", error);
    // Fallback to any available sample data
    return sampleProperties.filter(p => propertyIds.includes(p.id));
  }
}

export async function filterProperties(filters) {
  try {
    // Get all properties first (will use appropriate source based on availability)
    const allProperties = await getAllProperties();
    
    // Apply filters in memory
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
      filtered = filtered.filter(p => 
        p.features && p.features.bedrooms >= filters.minBedrooms);
    }
    
    // Apply sorting
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
    return sampleProperties;
  }
}

export async function searchProperties(keyword) {
  if (!keyword) return getAllProperties();
  
  try {
    // Get all properties first (will use appropriate source)
    const allProperties = await getAllProperties();
    
    // Filter by keyword
    const normalizedKeyword = keyword.toLowerCase();
    
    return allProperties.filter(property => {
      const searchableText = `${property.title} ${property.location} ${property.description}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    
    // Fallback to filtering sample data
    const normalizedKeyword = keyword.toLowerCase();
    return sampleProperties.filter(property => {
      const searchableText = `${property.title} ${property.location} ${property.description}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  }
}