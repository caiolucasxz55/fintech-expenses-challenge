'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Loader2, ArrowLeftRight } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
}

export function TransactionList({
  data,
  isLoading,
  isFetching,
  onEdit,
}: TransactionListProps) {
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const remove = useDeleteTransaction();

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const transactions = data?.data ?? [];

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ArrowLeftRight className="size-6 text-muted-foreground" />
        </span>
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
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.category?.name ?? '—'}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isIncome ? 'secondary' : 'outline'}>
                      {isIncome ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      isIncome ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(t.value)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Ações">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(t)}>
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setToDelete(t)}
                        >
                          <Trash2 />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
