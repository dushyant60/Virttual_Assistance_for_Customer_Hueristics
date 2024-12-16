// cacheUtils.js  
export const getCache = (key) => {  
    const cachedData = localStorage.getItem(key);  
    return cachedData ? JSON.parse(cachedData) : null;  
  };  
    
  export const setCache = (key, data) => {  
    localStorage.setItem(key, JSON.stringify(data));  
  };  
    
  export const clearCache = (key) => {  
    localStorage.removeItem(key);  
  };  
  