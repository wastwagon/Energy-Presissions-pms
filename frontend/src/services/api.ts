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
    const headers = config.headers as any;
    if (headers && typeof headers.set === 'function') {
      headers.set('Content-Type', undefined);
    }
    if (headers) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }
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
      if (path.startsWith('/pms')) {
        window.location.href = '/pms/admin';
      } else if (path.startsWith('/web/app')) {
        window.location.href = '/web/admin';
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

