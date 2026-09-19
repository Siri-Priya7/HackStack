import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'hi-IN');
  const [loading, setLoading] = useState(false);

  // Keep <html lang="..."> in sync so browser font/spellcheck reacts instantly
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (token) {
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
          console.warn('Profile fetch error, clearing invalid session:', err.message);
          logout();
        });
    }
  }, [token]);

  // Mobile OTP Authentication Flow
  const sendOtp = async (phone, purpose = 'login') => {
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(phone, purpose);
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send OTP.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone, otp) => {
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp(phone, otp);
      if (res.data.success && !res.data.isNewUser) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user.preferred_language) {
          setLanguage(res.data.user.preferred_language);
        }
      }
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Invalid OTP code.' };
    } finally {
      setLoading(false);
    }
  };

  // Voice-Guided Onboarding for Shop Owners
  const voiceOnboard = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.voiceOnboard(formData);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user.preferred_language) {
          setLanguage(res.data.user.preferred_language);
        }
      }
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Onboarding failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login by Role
  const loginWithRoleDemo = async (roleType) => {
    setLoading(true);
    try {
      let phone = '9876543210';
      if (roleType === 'platform_admin') phone = '9000000000';
      if (roleType === 'staff') phone = '9111111111';

      const res = await authAPI.verifyOtp(phone, '123456');
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user.preferred_language) {
          setLanguage(res.data.user.preferred_language);
        }
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.error };
    } catch (err) {
      return { success: false, error: 'Demo login error.' };
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

  const updateLanguage = (newLang) => {
    // Immediate: update state + localStorage + document lang attribute
    setLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
    // Sync to backend in background — never block UI for this
    if (user) {
      authAPI.updateLanguage(newLang)
        .then(() => setUser(prev => prev ? { ...prev, preferred_language: newLang } : prev))
        .catch(e => console.warn('Language sync error:', e));
    }
  };


  // Role helpers
  const isAdmin = user?.role === 'platform_admin';
  const isOwner = user?.role === 'shop_owner';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      language,
      setLanguage: updateLanguage,
      sendOtp,
      verifyOtp,
      voiceOnboard,
      loginWithRoleDemo,
      logout,
      loading,
      isAdmin,
      isOwner,
      isStaff,
      role: user?.role || 'guest',
      t: (key) => getTranslation(language, key),
      supportedLanguages: SUPPORTED_LANGUAGES
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
