import axios from 'axios';

// Use Vercel proxy in production to avoid CORS, direct URL in development
const API_BASE_URL = (import.meta as any).env.PROD 
  ? '/api/v1'  // Vercel will proxy this to Render backend
  : (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api/v1';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', (import.meta as any).env.MODE);
console.log('📍 Production:', (import.meta as any).env.PROD);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,  // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Skip demo token to avoid backend auth issues during development
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      // Only redirect if we're not in demo mode
      if (token && token !== 'demo-token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // For demo mode, just log the error but don't redirect
      console.warn('API request failed (demo mode):', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;