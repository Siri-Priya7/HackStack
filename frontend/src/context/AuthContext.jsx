import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Ramesh Sharma',
      store_name: 'Sharma Kirana & General Store',
      phone: '9876543210',
      preferred_language: 'hi-IN',
      role: 'owner'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo-token');
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'hi-IN');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo-token') {
      authAPI.getProfile()
        .then(res => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            if (res.data.user.preferred_language) {
              setLanguage(res.data.user.preferred_language);
            }
          }
        })
        .catch(err => {
          console.warn('Profile fetch fallback to demo:', err.message);
        });
    }
  }, [token]);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(phone, password);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateLanguage = async (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('lang', newLang);
    try {
      await authAPI.updateLanguage(newLang);
      setUser(prev => prev ? { ...prev, preferred_language: newLang } : prev);
    } catch (e) {
      console.warn('Could not sync language to backend:', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      language,
      setLanguage: updateLanguage,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
