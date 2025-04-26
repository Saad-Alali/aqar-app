import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB8KBTvSH8RZb97PXGg-D084g_vHiOx4PM",
  authDomain: "real-estate-app2-b5a0e.firebaseapp.com",
  projectId: "real-estate-app2-b5a0e",
  storageBucket: "real-estate-app2-b5a0e.firebasestorage.app",
  messagingSenderId: "820649708688",
  appId: "1:820649708688:web:f957d0f196c765fcc2dc15",
  measurementId: "G-JNHSBPXGJ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, db, auth, storage, analytics };