'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse, User } from '@/types';
import { tokenStorage } from '@/lib/token-storage';
import { authApi } from '@/lib/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Persiste a sessão após login/registro bem-sucedidos. */
  setSession: (auth: AuthResponse) => void;
  /** Encerra a sessão (best-effort no backend) e limpa o armazenamento. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Reidrata a sessão a partir do armazenamento ao montar.
  useEffect(() => {
    const storedUser = tokenStorage.getUser();
    const token = tokenStorage.getAccessToken();
    if (storedUser && token) {
      setUser(storedUser);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const setSession = useCallback((auth: AuthResponse) => {
    tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    tokenStorage.setUser(auth.user);
    setUser(auth.user);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignora erro de logout no servidor; a limpeza local é o que importa
    }
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
