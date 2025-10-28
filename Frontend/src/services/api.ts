import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://student-attendence-tracker.onrender.com/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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