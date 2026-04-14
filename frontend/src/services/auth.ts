import axios, { AxiosInstance } from 'axios';
import api from './api';
import { User } from '../types';
import { resolveApiUrl } from '../utils/apiUrl';

const API_URL = resolveApiUrl();

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Create a separate axios instance for login without default JSON headers
const loginAxios: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Trim credentials to remove any whitespace
    const username = credentials.username.trim();
    const password = credentials.password.trim();
    
    // Create form data as URLSearchParams and convert to string
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const formDataString = formData.toString();
    console.log('Login request:', {
      url: `${API_URL}/api/auth/login`,
      username: username,
      passwordLength: password.length,
      formDataPreview: formDataString.substring(0, 30) + '...',
    });
    
    // Use a separate axios instance without default JSON headers
    // Send as plain string with explicit Content-Type
    try {
      const response = await loginAxios.post(
        '/auth/login',
        formDataString,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000, // 10 second timeout
          // Prevent axios from transforming the data
          transformRequest: [(data) => {
            // If data is already a string, return it as-is
            return typeof data === 'string' ? data : data;
          }],
        }
      );
      console.log('Login success:', response.data);
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        code?: string;
        response?: { data?: { detail?: unknown }; status?: number; statusText?: string };
      };
      console.error('Login error:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        apiBase: API_URL,
      });
      const detail = err.response?.data?.detail;
      const detailStr =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join(', ')
            : '';
      if (detailStr) {
        throw new Error(detailStr);
      }
      const isNetwork =
        err.code === 'ERR_NETWORK' ||
        err.message === 'Network Error' ||
        (!err.response && err.message?.toLowerCase().includes('network'));
      if (isNetwork) {
        throw new Error(
          `Cannot reach the API at ${API_URL}. Check your connection, try another browser or network, ` +
            `or confirm the backend is running. If you use a custom domain, set REACT_APP_API_URL to your API base URL.`
        );
      }
      throw new Error(err.message || 'Login failed');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

