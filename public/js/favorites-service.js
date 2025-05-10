import { initializeJsonService, dataCache } from './json-service.js';

export async function getUserFavorites(userId) {
  try {
    await initializeJsonService();
    
    const user = dataCache.users.find(u => u.id === userId);
    
    if (!user) {
      return [];
    }
    
    const favoriteIds = user.favorites || [];
    
    if (favoriteIds.length === 0) {
      return [];
    }
    
    const properties = dataCache.properties.filter(p => favoriteIds.includes(p.id));
    
    return properties;
  } catch (error) {
    console.error("Error getting user favorites:", error);
    return [];
  }
}

export async function addToFavorites(userId, propertyId) {
  try {
    await initializeJsonService();
    
    const userIndex = dataCache.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return false;
    }
    
    const user = dataCache.users[userIndex];
    const favorites = [...(user.favorites || [])];
    
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      
      dataCache.users[userIndex].favorites = favorites;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return false;
  }
}

export async function removeFromFavorites(userId, propertyId) {
  try {
    await initializeJsonService();
    
    const userIndex = dataCache.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return false;
    }
    
    const user = dataCache.users[userIndex];
    let favorites = [...(user.favorites || [])];
    
    favorites = favorites.filter(id => id !== propertyId);
    
    dataCache.users[userIndex].favorites = favorites;
    
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return false;
  }
}

export async function isFavorite(userId, propertyId) {
  try {
    await initializeJsonService();
    
    const user = dataCache.users.find(u => u.id === userId);
    
    if (!user) {
      return false;
    }
    
    const favorites = user.favorites || [];
    return favorites.includes(propertyId);
  } catch (error) {
    console.error("Error checking if property is favorite:", error);
    return false;
  }
}