const dataCache = {
  properties: null,
  users: null,
  initialized: false
};

export async function initializeJsonService() {
  if (dataCache.initialized) {
    return dataCache;
  }
  
  try {
    const propertiesResponse = await fetch('data/properties.json');
    dataCache.properties = await propertiesResponse.json();
    
    const usersResponse = await fetch('data/users.json');
    dataCache.users = await usersResponse.json();
    
    syncWithLocalStorage();
    
    dataCache.initialized = true;
    return dataCache;
  } catch (error) {
    console.error('Error initializing JSON service:', error);
    
    // Load from localStorage if fetch fails
    loadFromLocalStorage();
    
    // If still not initialized, use sample data
    if (!dataCache.initialized) {
      dataCache.properties = getSampleProperties();
      dataCache.users = getSampleUsers();
      dataCache.initialized = true;
    }
    
    return dataCache;
  }
}

function syncWithLocalStorage() {
  const storedProperties = localStorage.getItem('aqar_properties');
  const storedUsers = localStorage.getItem('aqar_users');
  
  if (storedProperties) {
    try {
      const localProperties = JSON.parse(storedProperties);
      
      // Merge with fetched properties to ensure we have the latest data
      if (dataCache.properties) {
        dataCache.properties.forEach((property, index) => {
          const localProperty = localProperties.find(p => p.id === property.id);
          if (localProperty) {
            dataCache.properties[index] = { ...property, ...localProperty };
          }
        });
      } else {
        dataCache.properties = localProperties;
      }
    } catch (error) {
      console.error('Error parsing stored properties:', error);
    }
  }
  
  if (storedUsers) {
    try {
      const localUsers = JSON.parse(storedUsers);
      
      // Merge with fetched users
      if (dataCache.users) {
        dataCache.users.forEach((user, index) => {
          const localUser = localUsers.find(u => u.id === user.id);
          if (localUser) {
            dataCache.users[index] = { ...user, ...localUser };
          }
        });
        
        // Add any new users that were created locally
        localUsers.forEach(localUser => {
          if (!dataCache.users.some(u => u.id === localUser.id)) {
            dataCache.users.push(localUser);
          }
        });
      } else {
        dataCache.users = localUsers;
      }
    } catch (error) {
      console.error('Error parsing stored users:', error);
    }
  }
  
  // Save merged data back to localStorage
  saveToLocalStorage();
}

function loadFromLocalStorage() {
  const storedProperties = localStorage.getItem('aqar_properties');
  const storedUsers = localStorage.getItem('aqar_users');
  
  let initialized = false;
  
  if (storedProperties) {
    try {
      dataCache.properties = JSON.parse(storedProperties);
      initialized = true;
    } catch (error) {
      console.error('Error parsing stored properties:', error);
    }
  }
  
  if (storedUsers) {
    try {
      dataCache.users = JSON.parse(storedUsers);
      initialized = true;
    } catch (error) {
      console.error('Error parsing stored users:', error);
    }
  }
  
  if (initialized) {
    dataCache.initialized = true;
  }
}

export function saveToLocalStorage() {
  if (dataCache.properties) {
    localStorage.setItem('aqar_properties', JSON.stringify(dataCache.properties));
  }
  
  if (dataCache.users) {
    localStorage.setItem('aqar_users', JSON.stringify(dataCache.users));
  }
}

function getSampleProperties() {
  return [
    {
      id: 'prop1',
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
      dateAdded: "2023-06-15"
    },
    {
      id: 'prop2',
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
      dateAdded: "2023-05-20"
    },
    {
      id: 'prop3',
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
      dateAdded: "2023-04-10"
    }
  ];
}

function getSampleUsers() {
  return [
    {
      id: 'user1',
      email: "user@example.com",
      password: "password123",
      fullName: "مستخدم تجريبي",
      phone: "123456789",
      avatarUrl: "img/placeholder.jpg",
      favorites: ["prop1"]
    }
  ];
}

export { dataCache };