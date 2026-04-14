import axios from 'axios';
import { resolveApiUrl } from '../utils/apiUrl';

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
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

