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
      
      dataCache.initialized = true;
      return dataCache;
    } catch (error) {
      console.error('Error initializing JSON service:', error);
      dataCache.properties = getSampleProperties();
      dataCache.users = getSampleUsers();
      dataCache.initialized = true;
      return dataCache;
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