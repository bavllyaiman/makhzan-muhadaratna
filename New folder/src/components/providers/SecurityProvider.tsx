'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SessionUser } from '@/lib/shared/schemas';

/**
 * Client session store + CSRF-aware fetch wrapper.
 *
 * The session token lives in an httpOnly cookie and is NEVER exposed to JS —
 * this context only mirrors non-sensitive profile fields returned by the API.
 */

interface SecurityContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: <T>(input: string, init?: RequestInit) => Promise<T>;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

interface SessionResponse {
  user: SessionUser | null;
  csrfToken: string;
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const body = (await res.json()) as { data: SessionResponse };
      setUser(body.data.user);
      setCsrfToken(body.data.csrfToken);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const apiFetch = useCallback(
    async <T,>(input: string, init: RequestInit = {}): Promise<T> => {
      const method = (init.method ?? 'GET').toUpperCase();
      const headers = new Headers(init.headers);

      // Double-submit: only needed for state-changing verbs.
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      }
      headers.set('Accept', 'application/json');
      if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const res = await fetch(input, {
        ...init,
        method,
        headers,
        credentials: 'same-origin',
        cache: 'no-store',
      });

      const payload = (await res.json().catch(() => null)) as
        | { data?: T; error?: { message?: string } }
        | null;

      if (!res.ok) {
        throw new Error(payload?.error?.message ?? 'تعذّر إتمام الطلب');
      }
      return payload?.data as T;
    },
    [csrfToken],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.assign('/login');
    }
  }, [apiFetch]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout, apiFetch }),
    [user, loading, refresh, logout, apiFetch],
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity(): SecurityContextValue {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used inside <SecurityProvider>');
  return ctx;
}