import React, { createContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken } from '../utils/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ─── Auth Modal State ──────────────────────────────────────────
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  const openAuthModal = useCallback((message = '', callback = null) => {
    setAuthModalMessage(message);
    setPostAuthCallback(() => callback);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
    setPostAuthCallback(null);
  }, []);

  /**
   * Transfers guest itineraries to the currently logged in user
   */
  const claimGuestItineraries = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/claim-guest-itineraries');
      return data.claimed || 0;
    } catch (error) {
      console.error('Failed to claim guest itineraries:', error);
      return 0;
    }
  }, []);

  /**
   * Trigger the post-auth callback if one was registered
   */
  const triggerPostAuthCallback = useCallback(() => {
    if (postAuthCallback && typeof postAuthCallback === 'function') {
      postAuthCallback();
    }
  }, [postAuthCallback]);

  /**
   * Attempt to restore session on app load by calling /api/auth/refresh.
   * This uses the httpOnly refresh cookie, so it works across page reloads.
   */
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch {
      // No valid session — user is a guest visitor
      clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Sign up a new user
   */
  const signup = async ({ email, password, name }) => {
    const { data } = await api.post('/auth/signup', { email, password, name });
    return data;
  };

  /**
   * Log in with email + password
   * Returns { requiresTOTP, tempToken } if 2FA is enabled
   */
  const login = async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });

    if (data.requiresTOTP) {
      return { requiresTOTP: true, tempToken: data.tempToken };
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Automatically trigger callback if login succeeds
    setTimeout(() => {
      triggerPostAuthCallback();
    }, 0);

    return { requiresTOTP: false };
  };

  /**
   * Validate 2FA code during login
   */
  const validate2FA = async ({ tempToken, code }) => {
    const { data } = await api.post('/auth/2fa/validate', { tempToken, code });
    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Automatically trigger callback if 2FA verification succeeds
    setTimeout(() => {
      triggerPostAuthCallback();
    }, 0);

    return data;
  };

  /**
   * Log out
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors
    }
    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Handle OAuth callback — receive token from URL
   */
  const handleOAuthToken = useCallback(async (token) => {
    setAccessToken(token);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setIsAuthenticated(true);
      await claimGuestItineraries();
    } catch {
      clearAccessToken();
    }
  }, [claimGuestItineraries]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAuthModalOpen,
    authModalMessage,
    openAuthModal,
    closeAuthModal,
    claimGuestItineraries,
    signup,
    login,
    logout,
    validate2FA,
    handleOAuthToken,
    restoreSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
