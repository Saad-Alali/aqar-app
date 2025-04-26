import { firebaseConfig } from './firebase-config.js';

let app, db, auth, storage, analytics;

export async function initializeFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
    const { getFirestore, collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js");
    const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");
    const { getStorage, ref, uploadBytes, getDownloadURL } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js");
    const { getAnalytics } = 
      await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js");

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);

    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseAuth = auth;
    window.firebaseStorage = storage;
    window.firebaseAnalytics = analytics;
    
    window.firebaseFirestore = {
      collection, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove
    };

    console.log("Firebase successfully initialized");
    
    await initializeDatabase();
    
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    const { collection, getDocs, addDoc, setDoc, doc, getDoc } = window.firebaseFirestore;
    
    const propertiesRef = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesRef);
    
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
      
      for (const property of sampleProperties) {
        await addDoc(propertiesRef, property);
      }
      
      console.log("Sample properties added successfully!");
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

export { app, db, auth, storage, analytics };