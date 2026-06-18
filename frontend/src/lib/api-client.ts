import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  ApiEnvelope,
  ApiErrorBody,
  NormalizedApiError,
  TokenPair,
} from '@/types';
import { tokenStorage } from './token-storage';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Instância principal — todas as chamadas autenticadas passam por aqui. */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Instância isolada para o refresh, evitando recursão nos interceptors. */
const refreshClient: AxiosInstance = axios.create({ baseURL: BASE_URL });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_FREE_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

// --- Request: injeta o Bearer token --------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: tenta refresh único no 401 --------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthFree = AUTH_FREE_PATHS.some((p) => original?.url?.includes(p));

    if (status === 401 && original && !original._retry && !isAuthFree) {
      original._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshClient.post<ApiEnvelope<TokenPair>>(
          '/auth/refresh',
          { refreshToken },
        );
        const tokens = data.data;
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

function handleSessionExpired(): void {
  tokenStorage.clear();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/** Converte qualquer erro do Axios na forma normalizada que a UI consome. */
export function normalizeError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const raw = body?.message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : raw ?? error.message ?? 'Erro de comunicação com o servidor';
    return { status: error.response?.status ?? 0, message };
  }
  return { status: 0, message: 'Erro inesperado' };
}

/**
 * Wrapper tipado: executa a requisição, desembrulha o envelope `{ data }` do
 * backend e relança erros já normalizados. As chamadas em `api.ts` usam isto.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiEnvelope<T>>(config);
    return response.data.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export default apiClient;
