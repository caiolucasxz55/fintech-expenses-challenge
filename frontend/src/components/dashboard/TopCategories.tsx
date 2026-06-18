'use client';

import { TrendingDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface TopCategoriesProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

const BAR_COLORS = ['bg-primary', 'bg-blue-400', 'bg-blue-300'];

export function TopCategories({ stats, isLoading }: TopCategoriesProps) {
  const categories = stats?.topExpenseCategories ?? [];
  const totalExpense = parseFloat(stats?.totalExpense ?? '0');
  const maxValue = categories.reduce(
    (max, c) => Math.max(max, parseFloat(c.total)),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maiores saídas por categoria</CardTitle>
        <CardDescription>As 3 categorias com maior volume de saídas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma saída registrada no período.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map((category, index) => {
              const value = parseFloat(category.total);
              const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const share =
                totalExpense > 0 ? (value / totalExpense) * 100 : 0;
              return (
                <div key={category.categoryId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      {category.categoryName}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${BAR_COLORS[index] ?? 'bg-primary'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                      {share.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
