// public/js/firebase.js
import { firebaseConfig } from './firebase-config.js';

let app, db, auth, storage, analytics;
let firebaseInitialized = false;

export async function initializeFirebase() {
  if (firebaseInitialized) {
    return { app, db, auth, storage, analytics };
  }
  
  try {
    // First, import all modules before initializing them
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
    
    // Initialize the core Firebase app first
    app = initializeApp(firebaseConfig);
    window.firebaseApp = app;
    console.log("Firebase core successfully initialized");
    
    // Now initialize each service separately with proper error handling
    try {
      const { getAuth } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
      auth = getAuth(app);
      window.firebaseAuth = auth;
      console.log("Firebase Auth initialized successfully");
    } catch (authError) {
      console.error("Error initializing Firebase Auth:", authError);
    }
    
    try {
      const { getFirestore, collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } = 
        await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
      
      db = getFirestore(app);
      window.firebaseDb = db;
      
      // Make Firestore functions available globally
      window.firebaseFirestore = {
        collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove
      };
      
      console.log("Firebase Firestore initialized successfully");
    } catch (dbError) {
      console.error("Error initializing Firestore:", dbError);
    }
    
    try {
      const { getStorage } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js");
      storage = getStorage(app);
      window.firebaseStorage = storage;
      console.log("Firebase Storage initialized successfully");
    } catch (storageError) {
      console.error("Error initializing Storage:", storageError);
    }
    
    try {
      const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js");
      analytics = getAnalytics(app);
      window.firebaseAnalytics = analytics;
      console.log("Firebase Analytics initialized successfully");
    } catch (analyticsError) {
      console.error("Error initializing Analytics:", analyticsError);
    }
    
    firebaseInitialized = true;
    
    // Initialize database with sample data
    if (db) {
      console.log("Attempting to initialize database with sample data");
      initializeDatabaseSafely();
    } else {
      console.log("Database not initialized, skipping sample data initialization");
    }
    
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Critical error initializing Firebase:", error);
    return { app: null, db: null, auth: null, storage: null, analytics: null };
  }
}

async function initializeDatabaseSafely() {
  if (!db || !window.firebaseFirestore) {
    console.log("Database or Firestore functions not available");
    return false;
  }
  
  try {
    const { collection, getDocs, addDoc, query, limit } = window.firebaseFirestore;
    
    // Check if properties collection already has data
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(query(propertiesRef, limit(1)));
    
    if (propertiesSnapshot.empty) {
      console.log("Properties collection is empty, initializing with sample data");
      
      // Add just a single test property to check permissions
      const testProperty = {
        title: "Test Property",
        description: "This is a test property to verify database write permissions",
        dateAdded: new Date().toISOString()
      };
      
      try {
        const docRef = await addDoc(propertiesRef, testProperty);
        console.log("Test property added successfully with ID:", docRef.id);
        return true;
      } catch (writeError) {
        console.error("Failed to write to database:", writeError);
        return false;
      }
    } else {
      console.log("Database already contains properties. Skipping initialization.");
      return true;
    }
  } catch (error) {
    console.error("Error during database initialization:", error);
    return false;
  }
}

export { app, db, auth, storage, analytics };