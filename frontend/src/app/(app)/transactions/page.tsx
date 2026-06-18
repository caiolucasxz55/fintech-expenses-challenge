'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction, TransactionFilters as Filters } from '@/types';

const INITIAL_FILTERS: Filters = { page: 1, limit: 10 };

export default function TransactionsPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data, isLoading, isFetching } = useTransactions(filters);

  // Alterar qualquer filtro volta para a página 1; trocar de página, não.
  const patchFilters = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  const changePage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));
  const clearFilters = () => setFilters(INITIAL_FILTERS);

  const openCreate = () => {
    setSelected(null);
    setOpen(true);
  };
  const openEdit = (transaction: Transaction) => {
    setSelected(transaction);
    setOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transações"
        description="Registre e acompanhe as movimentações financeiras."
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <TransactionFilters
            filters={filters}
            onChange={patchFilters}
            onClear={clearFilters}
          />
        </CardContent>
      </Card>

      <Card>
        <TransactionList
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          onEdit={openEdit}
          onPageChange={changePage}
        />
      </Card>

      <TransactionForm
        open={open}
        onOpenChange={setOpen}
        transaction={selected}
      />
    </div>
  );
}
