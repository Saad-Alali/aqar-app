import { firebaseConfig } from './firebase-config.js';

let app, db, auth, storage, analytics;

export async function initializeFirebase() {
  try {
    const { initializeApp } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-app.js");
    const { getFirestore } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-firestore.js");
    const { getAuth } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-auth.js");
    const { getStorage } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-storage.js");
    const { getAnalytics } = await import("https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.2/firebase-analytics.js");

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

    console.log("Firebase successfully initialized");
    return { app, db, auth, storage, analytics };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

initializeFirebase().then(services => {
  app = services.app;
  db = services.db;
  auth = services.auth;
  storage = services.storage;
  analytics = services.analytics;
}).catch(error => {
  console.error("Firebase initialization failed:", error);
});

export { app, db, auth, storage, analytics };