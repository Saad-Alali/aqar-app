import { db } from './firebase.js';

export async function getAllProperties() {
  try {
    const { collection, getDocs } = window.firebaseFirestore;
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesRef);
    
    const properties = [];
    propertiesSnapshot.forEach(doc => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return properties;
  } catch (error) {
    console.error("Error getting properties:", error);
    throw error;
  }
}

export async function getProperty(propertyId) {
  try {
    const { doc, getDoc } = window.firebaseFirestore;
    const propertyRef = doc(db, "properties", propertyId);
    const propertySnapshot = await getDoc(propertyRef);
    
    if (propertySnapshot.exists()) {
      return {
        id: propertySnapshot.id,
        ...propertySnapshot.data()
      };
    } else {
      throw new Error("Property not found");
    }
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
    
    const { doc, getDoc } = window.firebaseFirestore;
    
    const propertiesPromises = propertyIds.map(id => getDoc(doc(db, "properties", id)));
    const propertiesSnapshots = await Promise.all(propertiesPromises);
    
    const properties = propertiesSnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => ({
        id: snapshot.id,
        ...snapshot.data()
      }));
    
    return properties;
  } catch (error) {
    console.error("Error getting properties by IDs:", error);
    throw error;
  }
}

export async function filterProperties(filters) {
  try {
    const { collection, getDocs, query, where, orderBy } = window.firebaseFirestore;
    let propertiesRef = collection(db, "properties");
    
    if (filters.propertyType) {
      propertiesRef = query(propertiesRef, where("propertyType", "==", filters.propertyType));
    }
    
    if (filters.transactionType) {
      propertiesRef = query(propertiesRef, where("transactionType", "==", filters.transactionType));
    }
    
    if (filters.minPrice && filters.maxPrice) {
      propertiesRef = query(
        propertiesRef, 
        where("price", ">=", filters.minPrice),
        where("price", "<=", filters.maxPrice)
      );
    } else if (filters.minPrice) {
      propertiesRef = query(propertiesRef, where("price", ">=", filters.minPrice));
    } else if (filters.maxPrice) {
      propertiesRef = query(propertiesRef, where("price", "<=", filters.maxPrice));
    }
    
    if (filters.minBedrooms) {
      propertiesRef = query(propertiesRef, where("features.bedrooms", ">=", filters.minBedrooms));
    }
    
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          propertiesRef = query(propertiesRef, orderBy("price", "asc"));
          break;
        case 'price-desc':
          propertiesRef = query(propertiesRef, orderBy("price", "desc"));
          break;
        case 'date-newest':
          propertiesRef = query(propertiesRef, orderBy("dateAdded", "desc"));
          break;
        case 'date-oldest':
          propertiesRef = query(propertiesRef, orderBy("dateAdded", "asc"));
          break;
      }
    }
    
    const propertiesSnapshot = await getDocs(propertiesRef);
    
    const properties = [];
    propertiesSnapshot.forEach(doc => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return properties;
  } catch (error) {
    console.error("Error filtering properties:", error);
    throw error;
  }
}

export async function searchProperties(keyword) {
  try {
    const { collection, getDocs } = window.firebaseFirestore;
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesRef);
    
    const properties = [];
    
    // Firebase doesn't have native full-text search, so we filter in memory
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      const propertyText = `${property.title} ${property.location} ${property.description}`.toLowerCase();
      
      if (propertyText.includes(keyword.toLowerCase())) {
        properties.push({
          id: doc.id,
          ...property
        });
      }
    });
    
    return properties;
  } catch (error) {
    console.error("Error searching properties:", error);
    throw error;
  }
}