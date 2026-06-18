import type { Category } from './category';

/** Tipo de movimentação — espelha o enum TransactionType do Prisma. */
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  /** Valor monetário; chega como string (Prisma Decimal). */
  value: string;
  type: TransactionType;
  /** Data ISO (YYYY-MM-DD). */
  date: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  description: string;
  value: string;
  type: TransactionType;
  date: string;
  categoryId: string;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

/** Query string aceita por GET /transactions. */
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
