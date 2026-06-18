'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { IncomeVsExpense } from '@/components/dashboard/IncomeVsExpense';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import type { DashboardQuery } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<DashboardQuery>({});
  const { data, isLoading } = useDashboard(period);

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Olá{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das finanças da empresa.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <SummaryCards stats={data} isLoading={isLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopCategories stats={data} isLoading={isLoading} />
        <IncomeVsExpense stats={data} isLoading={isLoading} />
      </div>
    </div>
  );
}
