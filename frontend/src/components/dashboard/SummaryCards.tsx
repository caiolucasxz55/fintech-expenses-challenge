'use client';

import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface SummaryCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

type Accent = 'primary' | 'success' | 'expense';

function StatCard({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent: Accent;
  hint: string;
}) {
  const accentClass = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-secondary text-secondary-foreground',
    expense: 'bg-accent text-accent-foreground',
  }[accent];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              accentClass,
            )}
          >
            {icon}
          </span>
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Saldo atual"
        value={formatCurrency(stats.balance)}
        icon={<Wallet className="size-5" />}
        accent="primary"
        hint="Entradas menos saídas"
      />
      <StatCard
        label="Total de entradas"
        value={formatCurrency(stats.totalIncome)}
        icon={<ArrowUpRight className="size-5" />}
        accent="success"
        hint="Receitas no período"
      />
      <StatCard
        label="Total de saídas"
        value={formatCurrency(stats.totalExpense)}
        icon={<ArrowDownLeft className="size-5" />}
        accent="expense"
        hint="Despesas no período"
      />
    </div>
  );
}
