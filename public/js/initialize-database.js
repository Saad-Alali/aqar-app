import { db } from './firebase.js';

/**
 * Initialize the database with sample data for testing purposes
 */
export async function initializeDatabase() {
  try {
    const { collection, getDocs, addDoc, query, limit } = window.firebaseFirestore;
    
    // Check if properties collection already has data
    const propertiesCollection = collection(db, "properties");
    const propertiesSnapshot = await getDocs(query(propertiesCollection, limit(1)));
    
    if (propertiesSnapshot.empty) {
      console.log("Initializing database with sample properties...");
      
      // Add sample properties
      for (const property of sampleProperties) {
        await addDoc(collection(db, "properties"), property);
      }
      
      console.log("Database initialized successfully!");
      return true;
    } else {
      console.log("Database already contains properties. Skipping initialization.");
      return false;
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// Sample property data for initial database seeding
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
  },
  {
    title: "شقة للإيجار",
    location: "وسط المدينة",
    price: 2500,
    priceFormatted: "$2,500/شهرياً",
    propertyType: "apartment",
    transactionType: "للإيجار",
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 900
    },
    description: "شقة حديثة مفروشة للإيجار في موقع مركزي. قريبة من وسائل النقل والمحلات التجارية.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  },
  {
    title: "مبنى تجاري",
    location: "المنطقة التجارية",
    price: 1500000,
    priceFormatted: "$1,500,000",
    propertyType: "commercial",
    transactionType: "للبيع",
    features: {
      bedrooms: 0,
      bathrooms: 4,
      area: 5000
    },
    description: "مبنى تجاري في موقع استراتيجي مناسب للمكاتب أو المحلات التجارية",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  },
  {
    title: "فيلا للإيجار",
    location: "ضواحي المدينة",
    price: 8000,
    priceFormatted: "$8,000/شهرياً",
    propertyType: "villa",
    transactionType: "للإيجار",
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2800
    },
    description: "فيلا فاخرة للإيجار مع حديقة كبيرة وحمام سباحة خاص",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString()
  }
];