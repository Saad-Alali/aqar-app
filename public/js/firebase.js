// public/js/firebase.js
import { firebaseConfig } from './firebase-config.js';

let app, db, auth, storage, analytics;
let firebaseInitialized = false;

export async function initializeFirebase() {
  if (firebaseInitialized) {
    return { app, db, auth, storage, analytics };
  }
  
  try {
    // Import Firebase modules
    const { initializeApp } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-app.js");
    const { getFirestore, collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-firestore.js");
    const { getAuth } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    const { getStorage } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-storage.js");
    const { getAnalytics } = 
      await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-analytics.js");

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize services with better error handling
    try {
      auth = getAuth(app);
      window.firebaseAuth = auth;
      console.log("Firebase Auth initialized successfully");
    } catch (authError) {
      console.error("Error initializing Firebase Auth:", authError);
    }
    
    try {
      db = getFirestore(app);
      window.firebaseDb = db;
      window.firebaseFirestore = {
        collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove
      };
      console.log("Firebase Firestore initialized successfully");
    } catch (dbError) {
      console.error("Error initializing Firestore:", dbError);
    }
    
    try {
      storage = getStorage(app);
      window.firebaseStorage = storage;
      console.log("Firebase Storage initialized successfully");
    } catch (storageError) {
      console.error("Error initializing Storage:", storageError);
    }
    
    try {
      analytics = getAnalytics(app);
      window.firebaseAnalytics = analytics;
      console.log("Firebase Analytics initialized successfully");
    } catch (analyticsError) {
      console.error("Error initializing Analytics:", analyticsError);
    }

    // Attach app to window for global access
    window.firebaseApp = app;
    
    console.log("Firebase core successfully initialized");
    
    // Set flag to avoid multiple initializations
    firebaseInitialized = true;
    
    // Initialize database with sample data
    // Use a more fault-tolerant approach with offline first strategy
    initializeDatabaseSafely();
    
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Critical error initializing Firebase:", error);
    
    // Enable basic offline functionality
    enableOfflineMode();
    
    return { app: null, db: null, auth: null, storage: null, analytics: null };
  }
}

async function initializeDatabaseSafely() {
  if (!db) {
    console.log("Database not initialized, skipping sample data initialization");
    return false;
  }
  
  try {
    const { collection, getDocs, addDoc, query, limit } = window.firebaseFirestore;
    
    // Check if properties collection already has data
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(query(propertiesRef, limit(1)));
    
    if (propertiesSnapshot.empty) {
      console.log("Properties collection is empty, initializing with sample data");
      
      // Only attempt to add a single test property first to verify permissions
      try {
        const testProperty = {
          title: "Test Property",
          description: "This is a test property to verify database write permissions",
          dateAdded: new Date().toISOString()
        };
        
        await addDoc(propertiesRef, testProperty);
        console.log("Successfully added test property, database write permissions confirmed");
        
        // Now add the rest of the sample properties
        // (code to add more sample properties would go here)
        
      } catch (writeError) {
        console.error("Failed to write to database, possible permission issue:", writeError);
        
        // Skip adding more sample data if we can't write
        return false;
      }
    } else {
      console.log("Database already contains properties. Skipping initialization.");
    }
    
    return true;
  } catch (error) {
    console.error("Error during database initialization:", error);
    return false;
  }
}

function enableOfflineMode() {
  console.log("Enabling offline mode functionality");
  // This function would set up offline data structures and mock functionality
  // For now, just a placeholder for proper offline mode implementation
}

export { app, db, auth, storage, analytics };