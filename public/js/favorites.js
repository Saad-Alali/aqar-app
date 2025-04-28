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
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
    const { getFirestore, collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
    const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { getStorage, ref, uploadBytes, getDownloadURL } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js");
    const { getAnalytics } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js");

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize services
    auth = getAuth(app);
    
    try {
      db = getFirestore(app);
    } catch (dbError) {
      console.error("Error initializing Firestore:", dbError);
      // Continue with other services, even if Firestore fails
    }
    
    try {
      storage = getStorage(app);
    } catch (storageError) {
      console.error("Error initializing Storage:", storageError);
      // Continue with other services, even if Storage fails
    }
    
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.error("Error initializing Analytics:", analyticsError);
      // Analytics is not critical, continue without it
    }

    // Attach to window for global access
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    
    if (db) window.firebaseDb = db;
    if (storage) window.firebaseStorage = storage;
    if (analytics) window.firebaseAnalytics = analytics;
    
    // Make Firestore functions available globally
    window.firebaseFirestore = {
      collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove
    };

    console.log("Firebase successfully initialized");
    
    // Set flag to avoid multiple initializations
    firebaseInitialized = true;
    
    // Initialize database with sample data
    try {
      await initializeDatabaseWithRetry();
    } catch (dbInitError) {
      console.warn("Could not initialize database with sample data:", dbInitError);
      // Not critical, app can still function
    }
    
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // Return partial initialization if possible
    return { app, db, auth, storage, analytics };
  }
}

async function initializeDatabaseWithRetry(maxRetries = 3) {
  if (!db) return false;
  
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { collection, getDocs, addDoc, query, limit } = window.firebaseFirestore;
      
      // Check if properties collection already has data
      const propertiesRef = collection(db, "properties");
      const propertiesSnapshot = await getDocs(query(propertiesRef, limit(1)));
      
      if (propertiesSnapshot.empty) {
        console.log("Initializing database with sample properties...");
        
        const sampleProperties = [
          {
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
            description: "شقة حديثة في قلب المدينة مع إطلالات رائعة وسهولة الوصول إلى جميع المرافق",
            imageUrl: "img/placeholder.jpg",
            dateAdded: new Date().toISOString()
          },
          {
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
            description: "فيلا فاخرة مع إطلالات بانورامية على البحر وحمام سباحة خاص",
            imageUrl: "img/placeholder.jpg",
            dateAdded: new Date().toISOString()
          },
          {
            title: "منزل عائلي",
            location: "الضواحي",
            price: 580000,
            priceFormatted: "$580,000",
            propertyType: "house",
            transactionType: "للبيع",
            features: {
              bedrooms: 4,
              bathrooms: 3,
              area: 2400
            },
            description: "منزل عائلي واسع في حي هادئ مع حديقة كبيرة ومطبخ حديث وقريب من المدارس",
            imageUrl: "img/placeholder.jpg",
            dateAdded: new Date().toISOString()
          }
        ];
        
        // Add properties one by one with error handling
        for (const property of sampleProperties) {
          try {
            await addDoc(propertiesRef, property);
          } catch (addError) {
            console.error("Error adding property:", addError);
            // Continue with other properties
          }
        }
        
        console.log("Sample properties added successfully!");
      } else {
        console.log("Database already contains properties. Skipping initialization.");
      }
      
      return true;
    } catch (error) {
      console.error(`Database initialization attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`Failed to initialize database after ${maxRetries} attempts`);
  return false;
}

export { app, db, auth, storage, analytics };