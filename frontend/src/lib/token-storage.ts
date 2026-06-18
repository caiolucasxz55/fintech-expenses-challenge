import type { User } from '@/types';

/**
 * Persistência da sessão no navegador.
 * Mantida isolada para que api-client e AuthContext compartilhem a mesma fonte
 * de verdade sem dependência circular.
 */

const ACCESS_KEY = 'fin.accessToken';
const REFRESH_KEY = 'fin.refreshToken';
const USER_KEY = 'fin.user';

const isBrowser = (): boolean => typeof window !== 'undefined';

export const tokenStorage = {
  getAccessToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefreshToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  getUser(): User | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
  setTokens(accessToken: string, refreshToken: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  setUser(user: User): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
