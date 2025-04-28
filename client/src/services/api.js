import axios from 'axios';

// Get the API URL from environment or use localhost as default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Log the API URL being used
console.log('Using API URL:', API_URL, 'ENV:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Changed to false to avoid CORS preflight issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the request in development
    console.log('API Request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging
    console.error('API Error:', error.response?.data || error.message || error);
    console.log('Request was made to:', error.config?.url);
    console.log('Full error details:', error);
    
    if (error.response?.status === 401) {
      // Clear all auth data and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      
      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
