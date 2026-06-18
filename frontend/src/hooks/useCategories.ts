'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '@/lib/api';
import type {
  Category,
  CreateCategoryPayload,
  NormalizedApiError,
  UpdateCategoryPayload,
} from '@/types';

const CATEGORIES_KEY = ['categories'] as const;

/** Lista as categorias do usuário autenticado. */
export function useCategories() {
  return useQuery<Category[], NormalizedApiError>({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.list,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, NormalizedApiError, CreateCategoryPayload>({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Categoria criada.');
    },
    onError: (error) => toast.error(error.message || 'Erro ao criar categoria.'),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation<
    Category,
    NormalizedApiError,
    { id: string; payload: UpdateCategoryPayload }
  >({
    mutationFn: ({ id, payload }) => categoriesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Categoria atualizada.');
    },
    onError: (error) =>
      toast.error(error.message || 'Erro ao atualizar categoria.'),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation<void, NormalizedApiError, string>({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Categoria excluída.');
    },
    onError: (error) =>
      toast.error(error.message || 'Erro ao excluir categoria.'),
  });
}
