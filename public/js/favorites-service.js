// public/js/favorites-service.js - with improved error handling
import { initializeFirebase, firestore } from './firebase.js';

// Sample data for fallback when Firebase is unavailable
const sampleFavorites = [
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
    imageUrl: "img/placeholder.jpg"
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
    imageUrl: "img/placeholder.jpg"
  }
];

// Cache for better performance and offline support
const favoriteCache = {
  userFavorites: {},
  timestamp: null
};

export async function getUserFavorites(userId) {
  try {
    // Ensure Firebase is initialized
    await initializeFirebase();
    
    // Check if we have cached favorites that are less than 5 minutes old
    if (favoriteCache.userFavorites[userId] && 
        favoriteCache.timestamp && 
        (Date.now() - favoriteCache.timestamp < 300000)) {
      console.log("Using cached favorites data");
      return favoriteCache.userFavorites[userId];
    }
    
    // Get Firestore functions - safely handle if firestore is unavailable
    const firestoreUtils = window.firebaseFirestore || firestore;
    if (!firestoreUtils || !firestoreUtils.doc || !firestoreUtils.getDoc) {
      console.warn("Firestore unavailable, using fallback data");
      return sampleFavorites;
    }
    
    const { doc, getDoc } = firestoreUtils;
    const db = window.firebaseDb;
    
    if (!db) {
      console.warn("Firestore DB unavailable, using fallback data");
      return sampleFavorites;
    }
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc || !userDoc.exists()) {
      console.log("User document not found, using empty favorites");
      return [];
    }
    
    const userData = userDoc.data();
    const favoriteIds = userData.favorites || [];
    
    // If no favorites, return empty array
    if (favoriteIds.length === 0) {
      return [];
    }
    
    // Try to get property details for each favorite
    try {
      const properties = await getPropertiesByIds(favoriteIds);
      
      // Cache the results
      favoriteCache.userFavorites[userId] = properties;
      favoriteCache.timestamp = Date.now();
      
      return properties;
    } catch (error) {
      console.error("Error getting property details:", error);
      // Return IDs only as fallback
      return favoriteIds.map(id => ({
        id: id,
        title: "Property " + id,
        location: "Unknown location",
        priceFormatted: "Price unavailable",
        features: { bedrooms: 0, bathrooms: 0, area: 0 },
        imageUrl: "img/placeholder.jpg"
      }));
    }
  } catch (error) {
    console.error("Error getting user favorites:", error);
    // Return sample data as fallback
    return sampleFavorites;
  }
}

export async function addToFavorites(userId, propertyId) {
  try {
    // Ensure Firebase is initialized
    await initializeFirebase();
    
    // Get Firestore functions - safely handle if firestore is unavailable
    const firestoreUtils = window.firebaseFirestore || firestore;
    if (!firestoreUtils || !firestoreUtils.doc || !firestoreUtils.updateDoc || !firestoreUtils.arrayUnion) {
      console.warn("Firestore unavailable, favorite action will be local only");
      
      // Update local cache
      if (!favoriteCache.userFavorites[userId]) {
        favoriteCache.userFavorites[userId] = [];
      }
      
      // Add to local cache if not already there
      if (!favoriteCache.userFavorites[userId].find(p => p.id === propertyId)) {
        favoriteCache.userFavorites[userId].push({
          id: propertyId,
          title: "Property " + propertyId,
          location: "Unknown location",
          priceFormatted: "Price unavailable",
          features: { bedrooms: 0, bathrooms: 0, area: 0 },
          imageUrl: "img/placeholder.jpg"
        });
      }
      
      return true;
    }
    
    const { doc, updateDoc, arrayUnion } = firestoreUtils;
    const db = window.firebaseDb;
    
    if (!db) {
      return false;
    }
    
    const userDocRef = doc(db, "users", userId);
    
    await updateDoc(userDocRef, {
      favorites: arrayUnion(propertyId),
      updatedAt: new Date().toISOString()
    });
    
    // Update cache
    favoriteCache.timestamp = null; // Invalidate cache
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return false;
  }
}

export async function removeFromFavorites(userId, propertyId) {
  try {
    // Ensure Firebase is initialized
    await initializeFirebase();
    
    // Get Firestore functions - safely handle if firestore is unavailable
    const firestoreUtils = window.firebaseFirestore || firestore;
    if (!firestoreUtils || !firestoreUtils.doc || !firestoreUtils.updateDoc || !firestoreUtils.arrayRemove) {
      console.warn("Firestore unavailable, favorite action will be local only");
      
      // Update local cache
      if (favoriteCache.userFavorites[userId]) {
        favoriteCache.userFavorites[userId] = favoriteCache.userFavorites[userId].filter(
          p => p.id !== propertyId
        );
      }
      
      return true;
    }
    
    const { doc, updateDoc, arrayRemove } = firestoreUtils;
    const db = window.firebaseDb;
    
    if (!db) {
      return false;
    }
    
    const userDocRef = doc(db, "users", userId);
    
    await updateDoc(userDocRef, {
      favorites: arrayRemove(propertyId),
      updatedAt: new Date().toISOString()
    });
    
    // Update cache
    favoriteCache.timestamp = null; // Invalidate cache
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return false;
  }
}

export async function isFavorite(userId, propertyId) {
  try {
    // Check cache first if available
    if (favoriteCache.userFavorites[userId]) {
      return favoriteCache.userFavorites[userId].some(p => p.id === propertyId);
    }
    
    // Try to get from Firestore
    const favorites = await getUserFavorites(userId);
    return favorites.some(p => p.id === propertyId);
  } catch (error) {
    console.error("Error checking if property is favorite:", error);
    return false;
  }
}

// Helper function to get property details by IDs
async function getPropertiesByIds(propertyIds) {
  // If no properties, return empty array
  if (!propertyIds || propertyIds.length === 0) {
    return [];
  }
  
  try {
    // Ensure Firebase is initialized
    await initializeFirebase();
    
    // Get Firestore functions
    const firestoreUtils = window.firebaseFirestore || firestore;
    if (!firestoreUtils || !firestoreUtils.doc || !firestoreUtils.getDoc) {
      // Fall back to sample data
      return sampleFavorites.filter(p => propertyIds.includes(p.id));
    }
    
    const { doc, getDoc } = firestoreUtils;
    const db = window.firebaseDb;
    
    if (!db) {
      return sampleFavorites.filter(p => propertyIds.includes(p.id));
    }
    
    // Get property documents
    const propertiesPromises = propertyIds.map(id => getDoc(doc(db, "properties", id)));
    const propertySnapshots = await Promise.all(propertiesPromises);
    
    // Convert to property objects
    const properties = propertySnapshots
      .filter(snapshot => snapshot.exists())
      .map(snapshot => ({
        id: snapshot.id,
        ...snapshot.data()
      }));
    
    // Return properties or sample data if none found
    return properties.length > 0 ? properties : sampleFavorites.filter(p => propertyIds.includes(p.id));
  } catch (error) {
    console.error("Error getting properties by IDs:", error);
    // Fall back to sample data
    return sampleFavorites.filter(p => propertyIds.includes(p.id));
  }
}