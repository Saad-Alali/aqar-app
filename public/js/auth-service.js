// public/js/auth-service.js

// In-memory user cache
let currentUserCache = null;

// Local storage key for offline user data
const LOCAL_STORAGE_USER_KEY = 'aqar_user';

export async function registerUser(email, password, fullName, phone) {
  try {
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      console.warn("Firebase Auth not initialized, using offline mode");
      return registerUserOffline(email, fullName, phone);
    }
    
    const { createUserWithEmailAndPassword, updateProfile } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
    const user = userCredential.user;
    
    // Update profile
    await updateProfile(user, {
      displayName: fullName,
      photoURL: "img/placeholder.jpg"
    });
    
    // Try to create user document in Firestore
    try {
      if (window.firebaseDb && window.firebaseFirestore) {
        const { doc, setDoc } = window.firebaseFirestore;
        
        await setDoc(doc(window.firebaseDb, "users", user.uid), {
          fullName: fullName,
          email: email,
          phone: phone || "",
          avatarUrl: "img/placeholder.jpg",
          favorites: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (firestoreError) {
      console.error("Error creating user document in Firestore:", firestoreError);
      // Continue without Firestore document - the auth user was created
    }
    
    // Create user object
    const userData = {
      id: user.uid,
      fullName: fullName,
      email: email,
      phone: phone || "",
      avatarUrl: "img/placeholder.jpg",
      favorites: []
    };
    
    // Cache the user
    currentUserCache = userData;
    
    // Also store in localStorage for offline access
    saveUserToLocalStorage(userData);
    
    return userData;
  } catch (error) {
    console.error("Error registering user:", error);
    
    // If the error is related to network or Firebase initialization, fall back to offline mode
    if (error.code === 'auth/network-request-failed' || !window.firebaseAuth) {
      console.warn("Falling back to offline registration mode");
      return registerUserOffline(email, fullName, phone);
    }
    
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      console.warn("Firebase Auth not initialized, using offline mode");
      return loginUserOffline(email, password);
    }
    
    const { signInWithEmailAndPassword } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    
    // Sign in
    const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
    const user = userCredential.user;
    
    let userData;
    
    // Try to get user data from Firestore
    try {
      if (window.firebaseDb && window.firebaseFirestore) {
        const { doc, getDoc } = window.firebaseFirestore;
        
        const userDoc = await getDoc(doc(window.firebaseDb, "users", user.uid));
        
        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          
          userData = {
            id: user.uid,
            fullName: firestoreData.fullName || user.displayName,
            email: firestoreData.email || user.email,
            phone: firestoreData.phone || "",
            avatarUrl: firestoreData.avatarUrl || user.photoURL || "img/placeholder.jpg",
            favorites: firestoreData.favorites || []
          };
        }
      }
    } catch (firestoreError) {
      console.error("Error getting user data from Firestore:", firestoreError);
      // Continue without Firestore data - we'll use auth data instead
    }
    
    // If we couldn't get Firestore data, use auth data
    if (!userData) {
      userData = {
        id: user.uid,
        fullName: user.displayName || "",
        email: user.email,
        phone: "",
        avatarUrl: user.photoURL || "img/placeholder.jpg",
        favorites: []
      };
    }
    
    // Cache the user
    currentUserCache = userData;
    
    // Also store in localStorage for offline access
    saveUserToLocalStorage(userData);
    
    return userData;
  } catch (error) {
    console.error("Error logging in:", error);
    
    // If the error is related to network or Firebase initialization, fall back to offline mode
    if (error.code === 'auth/network-request-failed' || !window.firebaseAuth) {
      console.warn("Falling back to offline login mode");
      return loginUserOffline(email, password);
    }
    
    throw error;
  }
}

export async function logoutUser() {
  try {
    // Clear cache and localStorage regardless of Firebase status
    currentUserCache = null;
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    
    // If Firebase Auth is not available, just return success
    if (!window.firebaseAuth) {
      return true;
    }
    
    const { signOut } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    
    // Sign out
    await signOut(window.firebaseAuth);
    
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    
    // Even if Firebase logout fails, still clear local data
    currentUserCache = null;
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    
    return true;
  }
}

export async function getCurrentUser() {
  // Return from cache if available
  if (currentUserCache) {
    return currentUserCache;
  }
  
  // Try to get from localStorage first
  const localUser = getUserFromLocalStorage();
  if (localUser) {
    currentUserCache = localUser;
    return localUser;
  }
  
  // If Firebase Auth is not available, return null
  if (!window.firebaseAuth) {
    return null;
  }
  
  return new Promise((resolve, reject) => {
    try {
      const unsubscribe = window.firebaseAuth.onAuthStateChanged(async (user) => {
        unsubscribe();
        
        if (!user) {
          resolve(null);
          return;
        }
        
        let userData;
        
        // Try to get user data from Firestore
        try {
          if (window.firebaseDb && window.firebaseFirestore) {
            const { doc, getDoc } = window.firebaseFirestore;
            
            const userDoc = await getDoc(doc(window.firebaseDb, "users", user.uid));
            
            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              
              userData = {
                id: user.uid,
                fullName: firestoreData.fullName || user.displayName,
                email: firestoreData.email || user.email,
                phone: firestoreData.phone || "",
                avatarUrl: firestoreData.avatarUrl || user.photoURL || "img/placeholder.jpg",
                favorites: firestoreData.favorites || []
              };
            }
          }
        } catch (firestoreError) {
          console.error("Error getting user data from Firestore:", firestoreError);
          // Continue without Firestore data
        }
        
        // If we couldn't get Firestore data, use auth data
        if (!userData) {
          userData = {
            id: user.uid,
            fullName: user.displayName || "",
            email: user.email,
            phone: "",
            avatarUrl: user.photoURL || "img/placeholder.jpg",
            favorites: []
          };
        }
        
        // Cache the user
        currentUserCache = userData;
        
        // Also store in localStorage for offline access
        saveUserToLocalStorage(userData);
        
        resolve(userData);
      }, reject);
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        unsubscribe();
        
        // If we time out, try to get from localStorage
        const localUser = getUserFromLocalStorage();
        if (localUser) {
          currentUserCache = localUser;
          resolve(localUser);
        } else {
          resolve(null);
        }
      }, 5000);
    } catch (error) {
      console.error("Error getting current user:", error);
      
      // If there's an error, try to get from localStorage
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        currentUserCache = localUser;
        resolve(localUser);
      } else {
        resolve(null);
      }
    }
  });
}

export async function toggleFavorite(userId, propertyId) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const favorites = user.favorites || [];
    const isFavorite = favorites.includes(propertyId);
    
    let updatedFavorites;
    
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = favorites.filter(id => id !== propertyId);
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, propertyId];
    }
    
    // Update in-memory cache and localStorage immediately for responsive UI
    if (currentUserCache) {
      currentUserCache.favorites = updatedFavorites;
    }
    
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      localUser.favorites = updatedFavorites;
      saveUserToLocalStorage(localUser);
    }
    
    // Try to update Firestore if available
    try {
      if (window.firebaseDb && window.firebaseFirestore) {
        const { doc, updateDoc, arrayUnion, arrayRemove } = window.firebaseFirestore;
        
        const userDocRef = doc(window.firebaseDb, "users", userId);
        
        if (isFavorite) {
          await updateDoc(userDocRef, {
            favorites: arrayRemove(propertyId),
            updatedAt: new Date().toISOString()
          });
        } else {
          await updateDoc(userDocRef, {
            favorites: arrayUnion(propertyId),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (firestoreError) {
      console.error("Error updating favorites in Firestore:", firestoreError);
      // Continue without Firestore update - we've already updated the local state
    }
    
    return !isFavorite; // Return whether it was added (true) or removed (false)
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

// ======== Offline Mode Helpers ========

function registerUserOffline(email, fullName, phone) {
  // Create a mock user
  const userData = {
    id: 'offline_' + Date.now(), // Generate a unique offline ID
    fullName: fullName,
    email: email,
    phone: phone || "",
    avatarUrl: "img/placeholder.jpg",
    favorites: [],
    isOfflineUser: true
  };
  
  // Store in localStorage
  saveUserToLocalStorage(userData);
  
  // Update cache
  currentUserCache = userData;
  
  return userData;
}

function loginUserOffline(email, password) {
  // Check if we have any users in localStorage
  const localUser = getUserFromLocalStorage();
  
  if (localUser && localUser.email === email) {
    // Update cache
    currentUserCache = localUser;
    return localUser;
  }
  
  // If no match found, throw an error
  throw new Error("Invalid email or password for offline login");
}

function saveUserToLocalStorage(userData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
    return false;
  }
}

function getUserFromLocalStorage() {
  try {
    const userData = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
}