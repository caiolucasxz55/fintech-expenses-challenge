'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface IncomeVsExpenseProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function IncomeVsExpense({ stats, isLoading }: IncomeVsExpenseProps) {
  const income = parseFloat(stats?.totalIncome ?? '0');
  const expense = parseFloat(stats?.totalExpense ?? '0');
  const max = Math.max(income, expense, 1);
  const balance = parseFloat(stats?.balance ?? '0');

  const rows = [
    { label: 'Entradas', value: income, bar: 'bg-success', text: 'text-success' },
    { label: 'Saídas', value: expense, bar: 'bg-destructive', text: 'text-destructive' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entradas × Saídas</CardTitle>
        <CardDescription>Composição do período</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {rows.map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className={cn('font-semibold tabular-nums', row.text)}>
                    {formatCurrency(row.value)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', row.bar)}
                    style={{ width: `${(row.value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-4 text-sm">
              <span className="font-medium text-muted-foreground">Resultado</span>
              <span
                className={cn(
                  'text-lg font-bold tabular-nums',
                  balance < 0 ? 'text-destructive' : 'text-success',
                )}
              >
                {formatCurrency(stats?.balance ?? '0')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
