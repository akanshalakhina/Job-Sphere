import axios from 'axios';

// Create an Axios instance with base URL pointing to our backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: Add interceptors for request/response handling, e.g., auth tokens
api.interceptors.request.use((config) => {
  // If using localStorage token, attach it here
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
