// public/js/firebase.js - Robust implementation with better error handling
import { firebaseConfig } from './firebase-config.js';

// Module-level variables to store Firebase instances
let app, db, auth, storage, analytics;
let firebaseInitialized = false;

// Store Firebase module functions directly
let firestore = {
  collection: null,
  getDocs: null,
  addDoc: null,
  setDoc: null,
  doc: null,
  getDoc: null,
  updateDoc: null,
  arrayUnion: null,
  arrayRemove: null,
  query: null,
  limit: null,
  where: null
};

export async function initializeFirebase() {
  if (firebaseInitialized) {
    return { app, db, auth, storage, analytics };
  }
  
  try {
    console.log("Starting Firebase initialization...");
    
    // Import Firebase modules with bundled CDN URL to avoid separate module loading issues
    const firebase = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-app.js");
    const { initializeApp } = firebase;
    
    // Initialize the core app
    app = initializeApp(firebaseConfig);
    window.firebaseApp = app;
    console.log("Firebase core successfully initialized");
    
    // Initialize services with try/catch blocks for each
    await initializeAuth();
    await initializeFirestore();
    await initializeStorage();
    await initializeAnalytics();
    
    // Set flag to avoid multiple initializations
    firebaseInitialized = true;
    
    // Initialize database with sample data if Firestore is ready
    if (db && firestore.collection) {
      console.log("Attempting to initialize database with sample data");
      initializeDatabaseSafely();
    } else {
      console.log("Database not initialized, skipping sample data initialization");
    }
    
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Critical error initializing Firebase:", error);
    
    // Enable basic offline functionality
    enableOfflineMode();
    
    return { app: app || null, db: db || null, auth: auth || null, storage: storage || null, analytics: analytics || null };
  }
}

async function initializeAuth() {
  try {
    const authModule = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    const { getAuth } = authModule;
    
    auth = getAuth(app);
    window.firebaseAuth = auth;
    console.log("Firebase Auth initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error);
    auth = null;
    window.firebaseAuth = null;
    return false;
  }
}

async function initializeFirestore() {
  try {
    const firestoreModule = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-firestore.js");
    const { 
      getFirestore, collection, getDocs, addDoc, setDoc, doc, getDoc, 
      updateDoc, arrayUnion, arrayRemove, query, limit, where 
    } = firestoreModule;
    
    db = getFirestore(app);
    window.firebaseDb = db;
    
    // Update our local firestore object
    firestore = {
      collection, getDocs, addDoc, setDoc, doc, getDoc,
      updateDoc, arrayUnion, arrayRemove, query, limit, where
    };
    
    // Make Firestore functions available globally
    window.firebaseFirestore = { ...firestore };
    
    console.log("Firebase Firestore initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Firestore:", error);
    db = null;
    window.firebaseDb = null;
    window.firebaseFirestore = createMockFirestore();
    return false;
  }
}

async function initializeStorage() {
  try {
    const storageModule = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-storage.js");
    const { getStorage } = storageModule;
    
    storage = getStorage(app);
    window.firebaseStorage = storage;
    console.log("Firebase Storage initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Storage:", error);
    storage = null;
    window.firebaseStorage = null;
    return false;
  }
}

async function initializeAnalytics() {
  try {
    const analyticsModule = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-analytics.js");
    const { getAnalytics } = analyticsModule;
    
    analytics = getAnalytics(app);
    window.firebaseAnalytics = analytics;
    console.log("Firebase Analytics initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Analytics:", error);
    analytics = null;
    window.firebaseAnalytics = null;
    return false;
  }
}

// Create mock Firestore functions for fallback
function createMockFirestore() {
  console.log("Creating mock Firestore functions for fallback");
  
  // Mock document reference
  const mockDocRef = {
    id: "mock-doc-id"
  };
  
  // Mock document snapshot
  const mockDocSnapshot = {
    exists: () => false,
    data: () => null,
    id: "mock-doc-id"
  };
  
  // Mock query snapshot
  const mockQuerySnapshot = {
    empty: true,
    docs: [],
    forEach: (callback) => {}
  };
  
  return {
    collection: () => ({ id: "mock-collection" }),
    doc: () => mockDocRef,
    getDoc: async () => mockDocSnapshot,
    getDocs: async () => mockQuerySnapshot,
    addDoc: async () => mockDocRef,
    setDoc: async () => {},
    updateDoc: async () => {},
    arrayUnion: (item) => [item],
    arrayRemove: (item) => [],
    query: () => ({}),
    limit: () => ({}),
    where: () => ({})
  };
}

async function initializeDatabaseSafely() {
  if (!db || !firestore.collection) {
    console.log("Database not initialized, skipping sample data initialization");
    return false;
  }
  
  try {
    // Check if properties collection already has data
    const propertiesRef = firestore.collection(db, "properties");
    const q = firestore.query(propertiesRef, firestore.limit(1));
    const propertiesSnapshot = await firestore.getDocs(q);
    
    if (propertiesSnapshot.empty) {
      console.log("Properties collection is empty, initializing with sample data");
      
      // Only attempt to add a single test property first to verify permissions
      try {
        const testProperty = {
          title: "Test Property",
          description: "This is a test property to verify database write permissions",
          dateAdded: new Date().toISOString()
        };
        
        await firestore.addDoc(propertiesRef, testProperty);
        console.log("Successfully added test property, database write permissions confirmed");
        
        // Success! We could add more sample data here if needed
        
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
  
  // Set up mock Firestore functions if real ones aren't available
  if (!window.firebaseFirestore) {
    window.firebaseFirestore = createMockFirestore();
  }
}

export { app, db, auth, storage, analytics, firestore };