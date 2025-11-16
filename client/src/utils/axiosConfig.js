import axios from 'axios';

// Configure axios defaults
// In development: React proxy (from package.json) forwards /api/* to http://localhost:5000
// In production: Set REACT_APP_API_URL environment variable
const baseURL = process.env.REACT_APP_API_URL;
if (baseURL) {
  axios.defaults.baseURL = baseURL;
}
// If no baseURL set, axios uses relative URLs which are proxied by React dev server
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;

