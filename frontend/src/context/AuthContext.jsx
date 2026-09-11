import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ems_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ems_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('ems_token', token);
    } else {
      localStorage.removeItem('ems_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ems_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ems_user');
    }
  }, [user]);

  // Check auth validity on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await authService.getCurrentUser();
        if (profile) {
          setUser((prev) => ({ ...prev, ...profile }));
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // If 401 or invalid token, reset
        if (err.status === 401) {
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const authToken = data.token;
    const userProfile = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };

    setToken(authToken);
    setUser(userProfile);
    localStorage.setItem('ems_token', authToken);
    localStorage.setItem('ems_user', JSON.stringify(userProfile));
    return userProfile;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
  }, []);

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
