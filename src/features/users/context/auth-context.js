import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth-api';
import { userService } from '../api/user-api';

const AuthContext = createContext(null);

const enrichWithProfile = async (base) => {
  try {
    const me = await userService.getMe();
    return { ...base, id: me.id, username: me.userName || base.username };
  } catch {
    return base;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check if prev logged in
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const userData = await authApi.login(credentials);
    const enriched = await enrichWithProfile(userData);
    setUser(enriched);
    localStorage.setItem('user', JSON.stringify(enriched));
    return enriched;
  };

  const updateUsername = async (newUsername) => {
    await authApi.updateUsername(newUsername);
    const updated = { ...user, username: newUsername };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const register = async (userData) => {
    const newUser = await authApi.register(userData);
    const enriched = await enrichWithProfile(newUser);
    setUser(enriched);
    localStorage.setItem('user', JSON.stringify(enriched));
    return enriched;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUsername,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
