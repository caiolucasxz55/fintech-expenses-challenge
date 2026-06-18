'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { transactionsApi } from '@/lib/api';
import type {
  CreateTransactionPayload,
  NormalizedApiError,
  Paginated,
  Transaction,
  TransactionFilters,
  UpdateTransactionPayload,
} from '@/types';

const TRANSACTIONS_KEY = ['transactions'] as const;

/** Lista paginada e filtrada. Mantém os dados anteriores ao paginar/filtrar. */
export function useTransactions(filters: TransactionFilters) {
  return useQuery<Paginated<Transaction>, NormalizedApiError>({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: () => transactionsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation<Transaction, NormalizedApiError, CreateTransactionPayload>({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação criada.');
    },
    onError: (error) => toast.error(error.message || 'Erro ao criar transação.'),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation<
    Transaction,
    NormalizedApiError,
    { id: string; payload: UpdateTransactionPayload }
  >({
    mutationFn: ({ id, payload }) => transactionsApi.update(id, payload),
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação atualizada.');
    },
    onError: (error) =>
      toast.error(error.message || 'Erro ao atualizar transação.'),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation<void, NormalizedApiError, string>({
    mutationFn: transactionsApi.remove,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação excluída.');
    },
    onError: (error) =>
      toast.error(error.message || 'Erro ao excluir transação.'),
  });
}
