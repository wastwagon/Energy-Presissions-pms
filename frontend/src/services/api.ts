import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let the browser set multipart boundaries for file uploads.
    delete config.headers?.['Content-Type'];
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      window.location.href = path.startsWith('/pms') ? '/pms/admin' : '/';
    }
    return Promise.reject(error);
  }
);

export default api;

