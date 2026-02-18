// Auth API and token storage for Phil CRM
// Подключено к Phil Backend (base URL: NEXT_PUBLIC_API_URL)
//
// Контракт API:
// - POST /api/auth/login/   — тело { username, password }, ответ { access, refresh, user }
// - POST /api/auth/logout/  — тело { refresh }
// - POST /api/auth/refresh/ — тело { refresh }, ответ { access }
// - GET  /api/auth/me/      — заголовок Authorization: Bearer <access>, ответ — объект пользователя
// Запросы к /api/links/ и /api/stats/ идут через apiRequest() с Authorization: Bearer <access>.

import { API_BASE_URL } from './config';

const AUTH_STORAGE_KEY = 'phil_auth';
const AUTH_COOKIE_NAME = 'phil_auth';
const COOKIE_MAX_AGE_DAYS = 7;
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // 5 min before expiry

export interface User {
  id: number | string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginCredentials {
  username: string; // username or email
  password: string;
}

export interface TokenPayload {
  access: string;
  refresh: string;
  user?: User;
  access_expires?: number; // optional: seconds until expiry from backend
}

export interface AuthTokens {
  access: string;
  refresh: string;
  expiresAt: number; // timestamp when access expires (we refresh before this)
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function parseExpiryFromJwt(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (typeof exp === 'number') {
      return exp * 1000; // to ms
    }
  } catch {
    // ignore
  }
  return Date.now() + 60 * 60 * 1000; // default 1h
}

export function getStoredTokens(): AuthTokens | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthTokens;
    if (!data.access || !data.refresh) return null;
    return data;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  const tokens = getStoredTokens();
  return tokens?.access ?? null;
}

function setAuthCookie(accessToken: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(accessToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

export function setStoredTokens(access: string, refresh: string, expiresAt?: number): void {
  const storage = getStorage();
  if (!storage) return;
  const expires = expiresAt ?? parseExpiryFromJwt(access);
  const data: AuthTokens = { access, refresh, expiresAt: expires };
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  setAuthCookie(access);
}

export function clearStoredTokens(): void {
  const storage = getStorage();
  if (storage) storage.removeItem(AUTH_STORAGE_KEY);
  clearAuthCookie();
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: 'invalid_credentials' | 'network' | 'unauthorized' | 'session_expired'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Login with username/email and password.
 * Stores tokens in localStorage and sets auth cookie for middleware.
 */
export async function login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
  const url = `${API_BASE_URL}/api/auth/login/`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
  } catch (e) {
    throw new AuthError('Ошибка сети. Проверьте подключение.', 'network');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      throw new AuthError(
        data.detail || data.message || 'Неверный логин или пароль',
        'invalid_credentials'
      );
    }
    if (res.status >= 500) {
      throw new AuthError(data.detail || data.message || 'Ошибка сервера', 'network');
    }
    throw new AuthError(data.detail || data.message || 'Ошибка входа', 'invalid_credentials');
  }

  const access = data.access ?? data.access_token;
  const refresh = data.refresh ?? data.refresh_token;
  if (!access || !refresh) {
    throw new AuthError('Сервер не вернул токены', 'network');
  }

  const user: User = data.user ?? {
    id: data.user_id ?? 0,
    username: data.username ?? credentials.username,
    email: data.email ?? credentials.username,
  };

  const expiresAt = data.access_expires
    ? Date.now() + data.access_expires * 1000
    : parseExpiryFromJwt(access);
  setStoredTokens(access, refresh, expiresAt);

  return {
    user,
    tokens: { access, refresh, expiresAt },
  };
}

/**
 * Logout: POST /api/auth/logout/ с телом { refresh }, затем очистка токенов.
 */
export async function logout(): Promise<void> {
  const tokens = getStoredTokens();
  const url = `${API_BASE_URL}/api/auth/logout/`;
  try {
    if (tokens?.refresh) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
    }
  } catch {
    // ignore network errors on logout
  } finally {
    clearStoredTokens();
  }
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshToken(): Promise<AuthTokens> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh) {
    clearStoredTokens();
    throw new AuthError('Сессия истекла', 'session_expired');
  }

  const url = `${API_BASE_URL}/api/auth/refresh/`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
  } catch {
    clearStoredTokens();
    throw new AuthError('Ошибка сети', 'network');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    clearStoredTokens();
    throw new AuthError(
      data.detail || data.message || 'Сессия истекла',
      'session_expired'
    );
  }

  const access = data.access ?? data.access_token;
  const refreshNew = data.refresh ?? data.refresh_token ?? tokens.refresh;
  if (!access) {
    clearStoredTokens();
    throw new AuthError('Неверный ответ сервера', 'session_expired');
  }

  const expiresAt = data.access_expires
    ? Date.now() + data.access_expires * 1000
    : parseExpiryFromJwt(access);
  setStoredTokens(access, refreshNew, expiresAt);

  return { access, refresh: refreshNew, expiresAt };
}

/**
 * Check if access token should be refreshed (within REFRESH_BEFORE_EXPIRY_MS of expiry).
 */
export function shouldRefreshToken(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return false;
  return Date.now() >= tokens.expiresAt - REFRESH_BEFORE_EXPIRY_MS;
}

/**
 * Get current user from API.
 */
export async function getMe(): Promise<User> {
  const token = getAccessToken();
  if (!token) throw new AuthError('Не авторизован', 'unauthorized');

  const url = `${API_BASE_URL}/api/auth/me/`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearStoredTokens();
    throw new AuthError('Сессия истекла', 'session_expired');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AuthError(data.detail || data.message || 'Ошибка загрузки профиля', 'unauthorized');
  }

  const data = await res.json();
  return {
    id: data.id ?? data.user_id,
    username: data.username ?? '',
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
  };
}
