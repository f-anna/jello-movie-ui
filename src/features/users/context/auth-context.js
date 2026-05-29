import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth-api';
import { userService } from '../api/user-api';

const AuthContext = createContext(null);

const mapMe = (me) => ({
  id: me.id,
  username: me.userName ?? null,
  email: me.email ?? null,
  profilePictureUrl: me.profilePictureUrl ?? null,
  isAdmin: me.isAdmin === true,
});

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
    let cancelled = false;
    (async () => {
      try {
        const me = await userService.getMe();
        if (!cancelled) setUser(mapMe(me));
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    await authApi.login(credentials);
    const next = mapMe(await userService.getMe());
    setUser(next);
    return next;
  };

  const register = async (userData) => {
    await authApi.register(userData);
    const next = mapMe(await userService.getMe());
    setUser(next);
    return next;
  };

  const updateUsername = async (newUsername) => {
    await authApi.updateUsername(newUsername);
    setUser(mapMe(await userService.getMe()));
  };

  const refreshUser = async () => {
    const next = mapMe(await userService.getMe());
    setUser(next);
    return next;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUsername,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
