import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount and verify
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('student_twin_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile on mount:', error);
          localStorage.removeItem('student_twin_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.otpRequired) {
        return { success: true, otpRequired: true, email: res.data.email };
      }

      localStorage.setItem('student_twin_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name || res.data.username,
        username: res.data.username || res.data.name,
        email: res.data.email,
        avatarStyle: res.data.avatarStyle,
        isOnboarded: res.data.isOnboarded,
        onboardingData: res.data.onboardingData,
        twinPersonality: res.data.twinPersonality,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  // Register handler
  const register = async (name, email, password, avatarStyle) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, avatarStyle });
      
      if (res.data.otpRequired) {
        return { success: true, otpRequired: true, email: res.data.email };
      }

      localStorage.setItem('student_twin_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name || res.data.username,
        username: res.data.username || res.data.name,
        email: res.data.email,
        avatarStyle: res.data.avatarStyle,
        isOnboarded: res.data.isOnboarded,
        onboardingData: res.data.onboardingData,
        twinPersonality: res.data.twinPersonality,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  // OTP Verification handler
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('student_twin_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name || res.data.username,
        username: res.data.username || res.data.name,
        email: res.data.email,
        avatarStyle: res.data.avatarStyle,
        isOnboarded: res.data.isOnboarded,
        onboardingData: res.data.onboardingData,
        twinPersonality: res.data.twinPersonality,
      });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired OTP verification code.',
      };
    }
  };

  // Resend OTP handler
  const resendOtp = async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification code.',
      };
    }
  };

  // Google OAuth Login handler
  const loginWithGoogle = async (credential) => {
    try {
      localStorage.removeItem('student_twin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (err) {
          console.warn('Google cancel warning:', err);
        }
      }

      const res = await api.post('/auth/google', { credential });
      localStorage.setItem('student_twin_token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name || res.data.username,
        username: res.data.username || res.data.name,
        email: res.data.email,
        avatarStyle: res.data.avatarStyle,
        isOnboarded: res.data.isOnboarded,
        onboardingData: res.data.onboardingData,
        twinPersonality: res.data.twinPersonality,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google authentication failed. Please try again.',
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('student_twin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.cancel();
      } catch (err) {
        console.warn('Google Account sign out cancel error:', err);
      }
    }
    setUser(null);
  };

  // Update Twin Avatar Configuration
  const updateAvatar = async (avatarStyle) => {
    try {
      const res = await api.put('/auth/avatar', { avatarStyle });
      setUser((prev) => ({
        ...prev,
        avatarStyle: res.data.avatarStyle,
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update avatar style.',
      };
    }
  };

  // Onboarding completion context update helper
  const completeOnboarding = (userData) => {
    setUser({
      _id: userData._id,
      name: userData.name || userData.username,
      username: userData.username || userData.name,
      email: userData.email,
      avatarStyle: userData.avatarStyle,
      isOnboarded: userData.isOnboarded,
      onboardingData: userData.onboardingData,
      twinPersonality: userData.twinPersonality,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
        logout,
        updateAvatar,
        completeOnboarding,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
