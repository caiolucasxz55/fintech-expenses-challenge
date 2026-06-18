'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import type { DashboardQuery, DashboardStats, NormalizedApiError } from '@/types';

/** Indicadores do dashboard, calculados na API para o período informado. */
export function useDashboard(query: DashboardQuery) {
  return useQuery<DashboardStats, NormalizedApiError>({
    queryKey: ['dashboard', query],
    queryFn: () => dashboardApi.stats(query),
  });
}
