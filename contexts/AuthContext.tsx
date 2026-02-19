'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@/lib/api/auth';
import {
  getStoredTokens,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshToken,
  shouldRefreshToken,
  clearStoredTokens,
  type LoginCredentials,
  AuthError,
} from '@/lib/api/auth';

const REFRESH_CHECK_INTERVAL_MS = 60 * 1000; // check every 1 min

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadUser = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setState((s) => ({ ...s, user: null, isAuthenticated: false, isLoading: false }));
      return;
    }
    try {
      const user = await getMe();
      setState((s) => ({ ...s, user, isAuthenticated: true, isLoading: false, error: null }));
    } catch (e) {
      // Only clear tokens for auth errors (expired/invalid token), not network errors
      const isAuthError = e instanceof AuthError &&
        (e.code === 'session_expired' || e.code === 'unauthorized');
      if (isAuthError) {
        clearStoredTokens();
        setState((s) => ({ ...s, user: null, isAuthenticated: false, isLoading: false, error: null }));
      } else {
        // Network error: keep the session, allow the user to stay logged in
        // The token is still in localStorage, so API calls will still work
        setState((s) => ({ ...s, isAuthenticated: true, isLoading: false }));
      }
    }
  }, []);

  const doRefresh = useCallback(async () => {
    if (!shouldRefreshToken()) return;
    try {
      await refreshToken();
    } catch {
      clearStoredTokens();
      setState((s) => ({
        ...s,
        user: null,
        isAuthenticated: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!state.isAuthenticated) return;
    doRefresh();
    refreshTimerRef.current = setInterval(doRefresh, REFRESH_CHECK_INTERVAL_MS);
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [state.isAuthenticated, doRefresh]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((s) => ({ ...s, error: null, isLoading: true }));
      try {
        const { user } = await apiLogin(credentials);
        setState((s) => ({
          ...s,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (e) {
        const message =
          e instanceof AuthError ? e.message : 'Ошибка входа. Проверьте данные и попробуйте снова.';
        setState((s) => ({
          ...s,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        }));
        throw e;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    await apiLogout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
