import axios, { AxiosInstance } from 'axios';

// Use Vite dev server proxy the frontend is running on
// The /api path will be proxied to http://localhost:8080 by Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log request for debugging
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API] Error:`, error.message, error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
