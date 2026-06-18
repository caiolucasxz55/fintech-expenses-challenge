'use client';

import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface SummaryCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  valueClass?: string;
  hint?: string;
}

function buildStats(stats: DashboardStats): Stat[] {
  const balance = parseFloat(stats.balance);
  const income = parseFloat(stats.totalIncome);
  const savingsRate = income > 0 ? (balance / income) * 100 : null;

  return [
    {
      label: 'Saldo atual',
      value: formatCurrency(stats.balance),
      icon: Wallet,
      iconClass: 'bg-primary/10 text-primary',
      valueClass: balance < 0 ? 'text-destructive' : 'text-foreground',
      hint: 'Entradas − saídas',
    },
    {
      label: 'Entradas',
      value: formatCurrency(stats.totalIncome),
      icon: ArrowDownLeft,
      iconClass: 'bg-success/10 text-success',
      valueClass: 'text-success',
      hint: 'Total de receitas no período',
    },
    {
      label: 'Saídas',
      value: formatCurrency(stats.totalExpense),
      icon: ArrowUpRight,
      iconClass: 'bg-destructive/10 text-destructive',
      valueClass: 'text-destructive',
      hint: 'Total de despesas no período',
    },
    {
      label: 'Taxa de poupança',
      value: savingsRate === null ? '—' : `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      iconClass: 'bg-blue-500/10 text-blue-600',
      valueClass:
        savingsRate !== null && savingsRate < 0 ? 'text-destructive' : undefined,
      hint: 'Quanto das entradas sobra',
    },
  ];
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = buildStats(stats);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  item.iconClass,
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
            </div>
            <p
              className={cn(
                'text-2xl font-bold tabular-nums',
                item.valueClass,
              )}
            >
              {item.value}
            </p>
            {item.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
