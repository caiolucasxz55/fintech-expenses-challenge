'use client';

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import type { DashboardQuery } from '@/types';

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardQuery>({});
  const { data, isLoading } = useDashboard(period);

  return (
    <div className="flex animate-fade-in flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Visão geral</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o fluxo financeiro da empresa.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <SummaryCards stats={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <TopCategories stats={data} isLoading={isLoading} />
        <RecentTransactions />
      </div>
    </div>
  );
}
