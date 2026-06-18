import { request } from './api-client';
import type {
  AuthResponse,
  Category,
  CreateCategoryPayload,
  CreateTransactionPayload,
  LoginPayload,
  Paginated,
  RegisterPayload,
  Transaction,
  TransactionFilters,
  UpdateCategoryPayload,
  UpdateTransactionPayload,
} from '@/types';

/**
 * Funções de acesso à API agrupadas por recurso.
 * Cada função usa o wrapper `request` (Axios + desembrulho do envelope +
 * normalização de erro). Os hooks React Query executam estas funções.
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>({ url: '/auth/login', method: 'POST', data: payload }),

  register: (payload: RegisterPayload) =>
    request<AuthResponse>({
      url: '/auth/register',
      method: 'POST',
      data: payload,
    }),

  logout: () => request<void>({ url: '/auth/logout', method: 'POST' }),
};

export const categoriesApi = {
  list: () => request<Category[]>({ url: '/categories', method: 'GET' }),

  create: (payload: CreateCategoryPayload) =>
    request<Category>({ url: '/categories', method: 'POST', data: payload }),

  update: (id: string, payload: UpdateCategoryPayload) =>
    request<Category>({ url: `/categories/${id}`, method: 'PUT', data: payload }),

  remove: (id: string) =>
    request<void>({ url: `/categories/${id}`, method: 'DELETE' }),
};

export const transactionsApi = {
  list: (filters: TransactionFilters) =>
    request<Paginated<Transaction>>({
      url: '/transactions',
      method: 'GET',
      params: filters,
    }),

  create: (payload: CreateTransactionPayload) =>
    request<Transaction>({ url: '/transactions', method: 'POST', data: payload }),

  update: (id: string, payload: UpdateTransactionPayload) =>
    request<Transaction>({
      url: `/transactions/${id}`,
      method: 'PUT',
      data: payload,
    }),

  remove: (id: string) =>
    request<void>({ url: `/transactions/${id}`, method: 'DELETE' }),
};
