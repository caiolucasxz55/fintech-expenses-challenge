'use client';

import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Loader2,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Paginated, Transaction } from '@/types';

interface TransactionListProps {
  data?: Paginated<Transaction>;
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
}

export function TransactionList({
  data,
  isLoading,
  isFetching,
  onEdit,
  onPageChange,
}: TransactionListProps) {
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const remove = useDeleteTransaction();

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  const transactions = data?.data ?? [];
  const meta = data?.meta;

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou registre uma nova movimentação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(isFetching && 'opacity-60 transition-opacity')}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tx.category?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isIncome ? 'success' : 'destructive'}>
                      {isIncome ? (
                        <ArrowDownLeft className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      )}
                      {isIncome ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      isIncome ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(tx.value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(tx)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(tx)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            {meta.total} {meta.total === 1 ? 'transação' : 'transações'} · página{' '}
            {meta.page} de {meta.lastPage}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isFetching}
              onClick={() => onPageChange(meta.page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage || isFetching}
              onClick={() => onPageChange(meta.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{toDelete?.description}&quot; será removida. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={remove.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
