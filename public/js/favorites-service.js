import { db } from './firebase.js';
import { getPropertiesByIds } from './property-service.js';

export async function getUserFavorites(userId) {
  try {
    const { doc, getDoc } = window.firebaseFirestore;
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    const favoriteIds = userData.favorites || [];
    
    return await getPropertiesByIds(favoriteIds);
  } catch (error) {
    console.error("Error getting user favorites:", error);
    throw error;
  }
}

export async function addToFavorites(userId, propertyId) {
  try {
    const { doc, updateDoc, getDoc, arrayUnion } = window.firebaseFirestore;
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    await updateDoc(userDocRef, {
      favorites: arrayUnion(propertyId),
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

export async function removeFromFavorites(userId, propertyId) {
  try {
    const { doc, updateDoc, getDoc, arrayRemove } = window.firebaseFirestore;
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    await updateDoc(userDocRef, {
      favorites: arrayRemove(propertyId),
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

export async function isFavorite(userId, propertyId) {
  try {
    const { doc, getDoc } = window.firebaseFirestore;
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    
    return favorites.includes(propertyId);
  } catch (error) {
    console.error("Error checking if property is favorite:", error);
    return false;
  }
}