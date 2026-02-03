import axios, { AxiosInstance } from 'axios';
import api from './api';
import { User } from '../types';

// Support both build-time env var and runtime config (injected via script tag)
// @ts-ignore - runtime config is injected via script tag
const API_URL = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      // Re-throw with a more descriptive error
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

