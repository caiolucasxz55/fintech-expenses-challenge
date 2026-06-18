'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export function RecentTransactions() {
  // As mais recentes vêm da API já ordenadas por data desc.
  const { data, isLoading } = useTransactions({ page: 1, limit: 5 });
  const recent = data?.data ?? [];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Últimas transações</CardTitle>
        <CardDescription>Movimentações mais recentes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma transação registrada ainda.
          </p>
        ) : (
          recent.map((t, i) => {
            const isIncome = t.type === 'income';
            return (
              <div
                key={t.id}
                className={cn(
                  'flex items-center justify-between gap-4 py-3',
                  i !== recent.length - 1 && 'border-b',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      isIncome
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-accent text-accent-foreground',
                    )}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownLeft className="size-4" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {t.description}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.category?.name ?? '—'} · {formatDate(t.date)}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    isIncome ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(t.value)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
