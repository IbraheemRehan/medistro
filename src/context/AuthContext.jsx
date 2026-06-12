import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../config/api.config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken]   = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }, []);

  // Sync token into Axios defaults
  useEffect(() => {
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common['Authorization'];
    }

    const unintercept = API.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response && err.response.status === 401) logout();
        return Promise.reject(err);
      }
    );
    return () => API.interceptors.response.eject(unintercept);
  }, [token, logout]);

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password, role) => {
    try {
      const { data } = await API.post('/api/v1/users/login', { email, password, role });
      const { user: userData, token: authToken } = data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      return { success: true, role: userData.role };
    } catch (err) {
      const errData = err.response?.data || {};
      return {
        success: false,
        message: errData.message || 'Login failed.',
        requiresVerification: errData.requiresVerification,
        email: errData.email,
      };
    }
  }, []);

  // ── Register ───────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    try {
      const { data } = await API.post('/api/v1/users/register', formData);
      return { success: true, data, email: data.user?.email };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  }, []);

  // ── Admin Login ───────────────────────────────────────────
  const adminLogin = useCallback(async (email, password) => {
    try {
      const { data } = await API.post('/api/v1/users/admin-login', { email, password });
      const { user: userData, token: authToken } = data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      return { success: true, role: userData.role };
    } catch (err) {
      const errData = err.response?.data || {};
      return {
        success: false,
        message: errData.message || 'Admin login failed.',
      };
    }
  }, []);

  // ── Verify Email OTP ───────────────────────────────────────
  const verifyEmail = useCallback(async (email, otp) => {
    try {
      const { data } = await API.post('/api/v1/users/verify-email', { email, otp });
      const { user: userData, token: authToken } = data;
      if (authToken) {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Verification failed.' };
    }
  }, []);

  // ── Resend OTP ─────────────────────────────────────────────
  const resendOTP = useCallback(async (email) => {
    try {
      await API.post('/api/v1/users/send-verification-otp', { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend OTP.' };
    }
  }, []);

  // ── Forgot Password ────────────────────────────────────────
  const sendForgotPasswordOTP = useCallback(async (email) => {
    try {
      await API.post('/api/v1/users/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed.' };
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    try {
      await API.post('/api/v1/users/reset-password', { email, otp, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed.' };
    }
  }, []);

  // ── Google OAuth token handler (called after redirect) ─────
  const loginWithGoogleToken = useCallback((token, role) => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userData = { id: payload._id, email: payload.email, role: payload.role || role };
      setUser(userData);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    } catch (e) {
      console.error('Google token parse error', e);
    }
  }, []);

  const value = {
    user, token, loading,
    isAuthenticated: !!user,
    login, logout, register, adminLogin,
    verifyEmail, resendOTP,
    sendForgotPasswordOTP, resetPassword,
    loginWithGoogleToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;