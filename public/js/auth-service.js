// public/js/auth-service.js

// In-memory user cache
let currentUserCache = null;

export async function registerUser(email, password, fullName, phone) {
  try {
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      throw new Error("Firebase Auth not initialized");
    }
    
    const { createUserWithEmailAndPassword, updateProfile } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    
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
    
    return userData;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      throw new Error("Firebase Auth not initialized");
    }
    
    const { signInWithEmailAndPassword } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    
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
    
    return userData;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      // Clear cache and return if no Firebase
      currentUserCache = null;
      return true;
    }
    
    const { signOut } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    
    // Sign out
    await signOut(window.firebaseAuth);
    
    // Clear cache
    currentUserCache = null;
    
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  // Return from cache if available
  if (currentUserCache) {
    return currentUserCache;
  }
  
  // Check if Firebase Auth is available
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
        
        resolve(userData);
      }, reject);
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 5000);
    } catch (error) {
      console.error("Error getting current user:", error);
      resolve(null);
    }
  });
}

export async function updateUserProfile(userId, userData) {
  try {
    // For offline support, update cache first
    if (currentUserCache && currentUserCache.id === userId) {
      currentUserCache = {
        ...currentUserCache,
        ...userData
      };
    }
    
    // Check if Firebase Auth is available
    if (!window.firebaseAuth) {
      throw new Error("Firebase Auth not initialized");
    }
    
    const user = window.firebaseAuth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    
    // Update auth profile
    await updateProfile(user, {
      displayName: userData.fullName,
      photoURL: userData.avatarUrl
    });
    
    // Try to update Firestore document
    try {
      if (window.firebaseDb && window.firebaseFirestore) {
        const { doc, updateDoc } = window.firebaseFirestore;
        
        await updateDoc(doc(window.firebaseDb, "users", userId), {
          fullName: userData.fullName,
          phone: userData.phone || "",
          avatarUrl: userData.avatarUrl || "img/placeholder.jpg",
          updatedAt: new Date().toISOString()
        });
      }
    } catch (firestoreError) {
      console.error("Error updating user profile in Firestore:", firestoreError);
      // Continue without Firestore update
    }
    
    return {
      id: userId,
      fullName: userData.fullName,
      email: user.email,
      phone: userData.phone || "",
      avatarUrl: userData.avatarUrl || "img/placeholder.jpg",
      favorites: userData.favorites || []
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function updateUserAvatar(userId, file) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // For simplicity in a disconnected environment, use a placeholder
    if (!window.firebaseStorage || !window.firebaseAuth) {
      // Update cache
      if (currentUserCache) {
        currentUserCache.avatarUrl = "img/placeholder.jpg";
      }
      
      return {
        ...user,
        avatarUrl: "img/placeholder.jpg"
      };
    }
    
    const { ref, uploadBytes, getDownloadURL } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js");
    const { updateProfile } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    
    // Upload file to Storage
    const storageRef = ref(window.firebaseStorage, `avatars/${userId}`);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update auth profile
    await updateProfile(window.firebaseAuth.currentUser, {
      photoURL: downloadURL
    });
    
    // Update Firestore document
    try {
      if (window.firebaseDb && window.firebaseFirestore) {
        const { doc, updateDoc, getDoc } = window.firebaseFirestore;
        
        await updateDoc(doc(window.firebaseDb, "users", userId), {
          avatarUrl: downloadURL,
          updatedAt: new Date().toISOString()
        });
        
        const userDoc = await getDoc(doc(window.firebaseDb, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Update cache
          if (currentUserCache) {
            currentUserCache = {
              ...currentUserCache,
              avatarUrl: downloadURL
            };
          }
          
          return {
            id: userId,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            avatarUrl: downloadURL,
            favorites: userData.favorites || []
          };
        }
      }
    } catch (firestoreError) {
      console.error("Error updating user avatar in Firestore:", firestoreError);
      // Continue without Firestore update
    }
    
    // Update cache
    if (currentUserCache) {
      currentUserCache.avatarUrl = downloadURL;
    }
    
    return {
      ...user,
      avatarUrl: downloadURL
    };
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
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
    
    // Update cache
    if (currentUserCache) {
      currentUserCache.favorites = updatedFavorites;
    }
    
    // Try to update Firestore
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
      // Continue without Firestore update
    }
    
    return !isFavorite; // Return whether it was added (true) or removed (false)
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}