'use client';

import { TrendingDown } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface TopCategoriesProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function TopCategories({ stats, isLoading }: TopCategoriesProps) {
  const categories = stats?.topExpenseCategories ?? [];
  const maxValue = categories.reduce(
    (max, c) => Math.max(max, parseFloat(c.total)),
    1,
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Maiores gastos</CardTitle>
        <CardDescription>Top 3 categorias por volume de despesa</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <TrendingDown className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma saída registrada no período.
            </p>
          </div>
        ) : (
          categories.map((category, i) => {
            const total = parseFloat(category.total);
            const width = Math.max((total / maxValue) * 100, 6);
            return (
              <div key={category.categoryId} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    {category.categoryName}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(category.total)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
