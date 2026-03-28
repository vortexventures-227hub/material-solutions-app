import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setAccessToken as setApiToken, setTokenRefreshCallback } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Update api client token when it changes
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // Set up token refresh callback on mount
  useEffect(() => {
    setTokenRefreshCallback(async () => {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    });
  }, [API_URL]);

  // Try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const token = response.data.accessToken;
        setAccessToken(token);
        setUser(response.data.user);
      } catch (error) {
        console.log('No valid session found');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [API_URL]);

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    const token = response.data.accessToken;
    setAccessToken(token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      const token = null;
      setAccessToken(token);
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const token = response.data.accessToken;
      setAccessToken(token);
      return token;
    } catch (error) {
      const token = null;
      setAccessToken(token);
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
