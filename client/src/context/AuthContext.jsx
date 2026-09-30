import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data.data.user);
        setStatus('authenticated');
      })
      .catch((error) => {
        if (!active) return;
        if (!error.response || error.response.status >= 500) {
          setAuthError('Hisob holatini tekshirish imkoni bo‘lmadi. Sahifani yangilab ko‘ring.');
          setStatus('error');
          return;
        }
        setStatus('guest');
      });

    return () => {
      active = false;
    };
  }, []);

  const authenticate = async (path, payload) => {
    setAuthError('');
    const { data } = await api.post(path, payload);
    setUser(data.data.user);
    setStatus('authenticated');
    return data.data.user;
  };

  const login = (credentials) => authenticate('/auth/login', credentials);
  const register = (details) => authenticate('/auth/register', details);

  const logout = async () => {
    setAuthError('');
    await api.post('/auth/logout');
    setUser(null);
    setStatus('guest');
    queryClient.clear();
  };

  const value = useMemo(() => ({
    user,
    status,
    authError,
    login,
    register,
    logout,
  }), [user, status, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return context;
}
