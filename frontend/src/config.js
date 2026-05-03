
const getBackendURL = () => {
  // 1. If we are running live on Vercel, force the production backend URL
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return 'https://placeaurabackend-indol.vercel.app/'; 
  }
  
  // 2. If running locally, use the Vite env variable or the localhost fallback
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_URL = getBackendURL();