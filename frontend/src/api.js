// frontend/src/api.js
// Centralized API configuration with auth support
import axios from 'axios';

// Use environment variable with fallback for local development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Access token storage (in memory, not localStorage for security)
let accessToken = null;
let tokenRefreshCallback = null;

// Create a configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh token
});

// Public method to set token (called by AuthContext)
export const setAccessToken = (token) => {
  accessToken = token;
};

// Public method to set refresh callback (called by AuthContext)
export const setTokenRefreshCallback = (callback) => {
  tokenRefreshCallback = callback;
};

// Request interceptor for adding auth headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we have a refresh callback and haven't retried yet
    if (
      error.response?.status === 401 &&
      tokenRefreshCallback &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await tokenRefreshCallback();
        setAccessToken(newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
