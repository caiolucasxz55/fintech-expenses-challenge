'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import type {
  Transaction,
  TransactionFilters as Filters,
  TransactionType,
} from '@/types';

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const [type, setType] = useState<'all' | TransactionType>('all');
  const [categoryId, setCategoryId] = useState('all');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filters = useMemo<Filters>(() => {
    const f: Filters = { page, limit: 10 };
    if (type !== 'all') f.type = type;
    if (categoryId !== 'all') f.categoryId = categoryId;
    if (period !== 'all') {
      const days = Number(period);
      const end = new Date();
      const start = new Date(end.getTime() - days * 86_400_000);
      f.startDate = ymd(start);
      f.endDate = ymd(end);
    }
    return f;
  }, [type, categoryId, period, page]);

  const { data, isLoading, isFetching } = useTransactions(filters);
  const meta = data?.meta;

  // Mudar qualquer filtro volta para a página 1.
  const onType = (v: 'all' | TransactionType) => { setType(v); setPage(1); };
  const onCategory = (v: string) => { setCategoryId(v); setPage(1); };
  const onPeriod = (v: string) => { setPeriod(v); setPage(1); };

  const openCreate = () => { setSelected(null); setOpen(true); };
  const openEdit = (transaction: Transaction) => {
    setSelected(transaction);
    setOpen(true);
  };

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TransactionFilters
          type={type}
          categoryId={categoryId}
          period={period}
          onTypeChange={onType}
          onCategoryChange={onCategory}
          onPeriodChange={onPeriod}
        />
        <Button onClick={openCreate} className="sm:shrink-0">
          <Plus className="size-4" />
          Nova transação
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <TransactionList
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          onEdit={openEdit}
        />
      </Card>

      {!isLoading && meta && meta.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {meta.total} {meta.total === 1 ? 'transação' : 'transações'} · página{' '}
            {meta.page} de {meta.lastPage}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <TransactionForm
        open={open}
        onOpenChange={setOpen}
        transaction={selected}
      />
    </div>
  );
}
