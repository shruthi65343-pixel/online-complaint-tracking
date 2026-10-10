import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resolvetrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear token if explicitly unauthorized on an authenticated endpoint
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin') && !currentPath.includes('/login')) {
        localStorage.removeItem('resolvetrack_token');
        localStorage.removeItem('resolvetrack_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
