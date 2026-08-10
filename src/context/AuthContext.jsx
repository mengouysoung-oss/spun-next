'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spun_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ user }) => setUser(user)).catch(() => {
      localStorage.removeItem('spun_token');
    }).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await api.post('/auth/login', { email, password });
    localStorage.setItem('spun_token', token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { user, token } = await api.post('/auth/register', payload);
    localStorage.setItem('spun_token', token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spun_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { user } = await api.put('/auth/me', payload);
    setUser(user);
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
