// Helper functions to convert Firestore Timestamps to JavaScript Dates
import { Timestamp } from "firebase/firestore";

export const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return new Date(timestamp);
};

export const convertFirestoreData = (data) => {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Convert Timestamps to Dates
  Object.keys(converted).forEach(key => {
    if (converted[key] && typeof converted[key] === 'object') {
      if (converted[key].seconds || converted[key] instanceof Timestamp) {
        converted[key] = convertTimestamp(converted[key]);
      } else if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map(item => 
          typeof item === 'object' && item.seconds ? convertTimestamp(item) : item
        );
      } else if (typeof converted[key] === 'object') {
        converted[key] = convertFirestoreData(converted[key]);
      }
    }
  });
  
  return converted;
};

