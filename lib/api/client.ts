// Клиент для запросов к Phil Backend: добавляет Authorization: Bearer <access>,
// при 401 вызывает POST /api/auth/refresh/ с refresh и повторяет запрос.
// Используется для /api/links/ и /api/stats/.

import { getAccessToken, refreshToken } from './auth';

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshToken()
    .then(() => {
      refreshPromise = null;
    })
    .catch(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

/**
 * Fetch with automatic Authorization: Bearer <access_token> and 401 → refresh → retry.
 * Token is taken from getAccessToken() (set in localStorage after login).
 * Use this for all authenticated API calls (links, stats/dashboard, activity, etc.).
 */
export async function apiRequest<T = unknown>(
  input: RequestInfo | URL,
  init: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchInit } = init;
  const headers = new Headers(fetchInit.headers);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(input, { ...fetchInit, headers });

  if (res.status === 401 && !skipAuth) {
    try {
      await doRefresh();
      const newToken = getAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        res = await fetch(input, { ...fetchInit, headers });
      }
    } catch {
      // refresh failed, return original 401 response
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (typeof data.message === 'string') {
        message = data.message;
      } else if (typeof data.error === 'string') {
        message = data.error;
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Django-style field errors: { "field_name": ["error"] }
        const parts = Object.entries(data)
          .filter(([, v]) => Array.isArray(v) && v.length > 0)
          .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`);
        if (parts.length > 0) message = parts.join('; ');
      }
    } catch {
      // use statusText
    }
    throw new Error(message || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}
