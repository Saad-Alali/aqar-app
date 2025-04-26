import { auth, db } from './firebase.js';

export async function registerUser(email, password, fullName, phone) {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { doc, setDoc } = window.firebaseFirestore;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, {
      displayName: fullName,
      photoURL: "img/placeholder.jpg"
    });
    
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      phone: phone || "",
      avatarUrl: "img/placeholder.jpg",
      favorites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      id: user.uid,
      fullName: fullName,
      email: email,
      phone: phone || "",
      avatarUrl: "img/placeholder.jpg",
      favorites: []
    };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { doc, getDoc } = window.firebaseFirestore;
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      return {
        id: user.uid,
        fullName: userData.fullName || user.displayName,
        email: userData.email || user.email,
        phone: userData.phone || "",
        avatarUrl: userData.avatarUrl || user.photoURL || "img/placeholder.jpg",
        favorites: userData.favorites || []
      };
    } else {
      return {
        id: user.uid,
        fullName: user.displayName || "",
        email: user.email,
        phone: "",
        avatarUrl: user.photoURL || "img/placeholder.jpg",
        favorites: []
      };
    }
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const { signOut } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    try {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (user) {
          const { doc, getDoc } = window.firebaseFirestore;
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              id: user.uid,
              fullName: userData.fullName || user.displayName,
              email: userData.email || user.email,
              phone: userData.phone || "",
              avatarUrl: userData.avatarUrl || user.photoURL || "img/placeholder.jpg",
              favorites: userData.favorites || []
            });
          } else {
            resolve({
              id: user.uid,
              fullName: user.displayName || "",
              email: user.email,
              phone: "",
              avatarUrl: user.photoURL || "img/placeholder.jpg",
              favorites: []
            });
          }
        } else {
          resolve(null);
        }
      }, reject);
    } catch (error) {
      reject(error);
    }
  });
}

export async function updateUserProfile(userId, userData) {
  try {
    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { doc, updateDoc } = window.firebaseFirestore;
    
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: userData.fullName,
        photoURL: userData.avatarUrl
      });
      
      await updateDoc(doc(db, "users", userId), {
        fullName: userData.fullName,
        phone: userData.phone || "",
        avatarUrl: userData.avatarUrl || "img/placeholder.jpg",
        updatedAt: new Date().toISOString()
      });
      
      return {
        id: userId,
        fullName: userData.fullName,
        email: user.email,
        phone: userData.phone || "",
        avatarUrl: userData.avatarUrl || "img/placeholder.jpg",
        favorites: userData.favorites || []
      };
    }
    
    throw new Error("User not authenticated");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function updateUserAvatar(userId, file) {
  try {
    const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js");
    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { doc, updateDoc, getDoc } = window.firebaseFirestore;
    
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const storageRef = ref(storage, `avatars/${userId}`);
    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    await updateProfile(user, {
      photoURL: downloadURL
    });
    
    await updateDoc(doc(db, "users", userId), {
      avatarUrl: downloadURL,
      updatedAt: new Date().toISOString()
    });
    
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    
    return {
      id: userId,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      avatarUrl: downloadURL,
      favorites: userData.favorites || []
    };
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
}

export async function toggleFavorite(userId, propertyId) {
  try {
    const { doc, getDoc, updateDoc, arrayUnion, arrayRemove } = window.firebaseFirestore;
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    
    if (favorites.includes(propertyId)) {
      await updateDoc(userDocRef, {
        favorites: arrayRemove(propertyId),
        updatedAt: new Date().toISOString()
      });
      return false;
    } else {
      await updateDoc(userDocRef, {
        favorites: arrayUnion(propertyId),
        updatedAt: new Date().toISOString()
      });
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}