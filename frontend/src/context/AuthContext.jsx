import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  username: 'admin',
  fullName: 'Administrator',
  email: 'admin@ems.com',
  role: 'ROLE_ADMIN',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token, setToken] = useState('ems-session');
  const loading = false;

  const login = useCallback(async (credentials) => {
    const loggedUser = {
      id: 1,
      username: credentials?.username || 'admin',
      fullName: credentials?.username ? credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1) : 'Administrator',
      email: `${credentials?.username || 'admin'}@ems.com`,
      role: 'ROLE_ADMIN',
    };
    setUser(loggedUser);
    setToken('ems-session');
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    setToken('ems-session');
  }, []);

  const isAdmin = true;
  const isAuthenticated = true;

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

