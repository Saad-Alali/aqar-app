import { db } from './firebase.js';
import { collection, getDocs, addDoc, query, where, limit } from "firebase/firestore";

// Sample property data for initial database seeding
const sampleProperties = [
  {
    title: "Modern Apartment",
    location: "Downtown, City Center",
    price: 350000,
    propertyType: "apartment",
    transactionType: "للبيع",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200
    },
    description: "A beautiful modern apartment in the heart of the city with stunning views and easy access to amenities.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Luxury Villa",
    location: "Beachfront, Ocean Drive",
    price: 1250000,
    propertyType: "villa",
    transactionType: "للبيع",
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 3500
    },
    description: "Stunning beachfront villa with panoramic ocean views, private pool, and luxury finishes throughout.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Family Home",
    location: "Suburban, Green Valley",
    price: 580000,
    propertyType: "house",
    transactionType: "للبيع",
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2400
    },
    description: "Spacious family home in a quiet neighborhood with large backyard, modern kitchen, and close to schools.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Penthouse Suite",
    location: "Downtown, Skyline Tower",
    price: 950000,
    propertyType: "apartment",
    transactionType: "للبيع",
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2100
    },
    description: "Stunning penthouse with panoramic city views, private terrace, and high-end finishes throughout.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Waterfront Cottage",
    location: "Countryside, Lakeside",
    price: 420000,
    propertyType: "house",
    transactionType: "للبيع",
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1600
    },
    description: "Charming cottage with direct lake access, private dock, and beautiful natural surroundings.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "City Studio",
    location: "Downtown, Arts District",
    price: 1800,
    propertyType: "apartment",
    transactionType: "للإيجار",
    features: {
      bedrooms: 1,
      bathrooms: 1,
      area: 650
    },
    description: "Cozy studio in the vibrant arts district, perfect for young professionals.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Commercial Space",
    location: "Downtown, Business Center",
    price: 780000,
    propertyType: "commercial",
    transactionType: "للبيع",
    features: {
      bedrooms: 0,
      bathrooms: 2,
      area: 2800
    },
    description: "Prime commercial space in the business district, perfect for office or retail with high foot traffic.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Mountain Retreat",
    location: "Countryside, Alpine Heights",
    price: 890000,
    propertyType: "house",
    transactionType: "للبيع",
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2900
    },
    description: "Beautiful mountain home with stunning views, wrap-around deck, and spacious interiors.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Suburban Townhouse",
    location: "Suburban, Maple Drive",
    price: 2500,
    propertyType: "house",
    transactionType: "للإيجار",
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1800
    },
    description: "Modern townhouse in a family-friendly community with park, pool, and walking trails.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Luxury Condo",
    location: "Downtown, Harbor View",
    price: 675000,
    propertyType: "apartment",
    transactionType: "للبيع",
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1500
    },
    description: "Elegant condo with harbor views, premium finishes, and access to exclusive building amenities.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Historic Brownstone",
    location: "Downtown, Historic District",
    price: 4200,
    propertyType: "house",
    transactionType: "للإيجار",
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2700
    },
    description: "Beautifully renovated historic brownstone with original details, modern updates, and private garden.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  },
  {
    title: "Garden Apartment",
    location: "Suburban, Willow Creek",
    price: 1500,
    propertyType: "apartment",
    transactionType: "للإيجار",
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 950
    },
    description: "Charming first-floor apartment with private garden, updated kitchen, and ample natural light.",
    imageUrl: "img/placeholder.jpg",
    dateAdded: new Date().toISOString().split('T')[0]
  }
];

/**
 * Initialize database with sample properties if empty
 */
export async function initializeDatabase() {
  try {
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
    throw error;
  }
}

/**
 * Get property types with counts
 */
export async function getPropertyTypeCounts() {
  try {
    const propertiesCollection = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesCollection);
    
    const typeCounts = {
      apartment: 0,
      house: 0,
      villa: 0,
      commercial: 0,
      total: 0
    };
    
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      typeCounts.total++;
      
      if (property.propertyType) {
        typeCounts[property.propertyType] = (typeCounts[property.propertyType] || 0) + 1;
      }
    });
    
    return typeCounts;
  } catch (error) {
    console.error("Error getting property type counts:", error);
    throw error;
  }
}

/**
 * Get transaction type counts (للبيع vs للإيجار)
 */
export async function getTransactionTypeCounts() {
  try {
    const propertiesCollection = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesCollection);
    
    const transactionCounts = {
      "للبيع": 0,
      "للإيجار": 0,
      total: 0
    };
    
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      transactionCounts.total++;
      
      if (property.transactionType) {
        transactionCounts[property.transactionType]++;
      } else {
        // Fallback based on price if transactionType is not available
        if (property.price && property.price >= 100000) {
          transactionCounts["للبيع"]++;
        } else {
          transactionCounts["للإيجار"]++;
        }
      }
    });
    
    return transactionCounts;
  } catch (error) {
    console.error("Error getting transaction type counts:", error);
    throw error;
  }
}

/**
 * Get price statistics by property type
 */
export async function getPriceStatistics() {
  try {
    const propertiesCollection = collection(db, "properties");
    const propertiesSnapshot = await getDocs(propertiesCollection);
    
    const stats = {
      apartment: { min: Infinity, max: 0, avg: 0, count: 0, sum: 0 },
      house: { min: Infinity, max: 0, avg: 0, count: 0, sum: 0 },
      villa: { min: Infinity, max: 0, avg: 0, count: 0, sum: 0 },
      commercial: { min: Infinity, max: 0, avg: 0, count: 0, sum: 0 },
      all: { min: Infinity, max: 0, avg: 0, count: 0, sum: 0 }
    };
    
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      
      if (property.price) {
        const price = property.price;
        const type = property.propertyType || 'other';
        
        // Update overall stats
        stats.all.min = Math.min(stats.all.min, price);
        stats.all.max = Math.max(stats.all.max, price);
        stats.all.sum += price;
        stats.all.count++;
        
        // Update type-specific stats
        if (stats[type]) {
          stats[type].min = Math.min(stats[type].min, price);
          stats[type].max = Math.max(stats[type].max, price);
          stats[type].sum += price;
          stats[type].count++;
        }
      }
    });
    
    // Calculate averages
    Object.keys(stats).forEach(key => {
      if (stats[key].count > 0) {
        stats[key].avg = Math.round(stats[key].sum / stats[key].count);
      }
      
      // Handle no data cases
      if (stats[key].min === Infinity) {
        stats[key].min = 0;
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Error getting price statistics:", error);
    throw error;
  }
}