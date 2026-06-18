'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useCategories';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import type { CreateTransactionPayload, Transaction, TransactionType } from '@/types';

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}

const today = () => new Date().toISOString().slice(0, 10);

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'income', label: 'Entrada' },
  { value: 'expense', label: 'Saída' },
];

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
}: TransactionFormProps) {
  const isEdit = Boolean(transaction);
  const { data: categories = [] } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionPayload>();

  useEffect(() => {
    if (open) {
      reset({
        description: transaction?.description ?? '',
        value: transaction?.value ?? '',
        type: transaction?.type ?? 'expense',
        date: transaction?.date?.slice(0, 10) ?? today(),
        categoryId: transaction?.categoryId ?? '',
      });
    }
  }, [open, transaction, reset]);

  const onSubmit = (data: CreateTransactionPayload) => {
    const payload: CreateTransactionPayload = {
      ...data,
      description: data.description.trim(),
      value: String(data.value),
    };
    const onSuccess = () => onOpenChange(false);
    if (isEdit && transaction) {
      update.mutate({ id: transaction.id, payload }, { onSuccess });
    } else {
      create.mutate(payload, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída no fluxo de caixa da empresa.
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 ? (
          <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Crie ao menos uma categoria antes de registrar transações.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="inline-flex w-full rounded-lg border bg-muted p-1">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          field.value === opt.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex.: Pagamento de cliente"
                autoComplete="off"
                {...register('description', {
                  required: 'Informe a descrição',
                  maxLength: { value: 255, message: 'Máximo de 255 caracteres' },
                })}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...register('value', {
                    required: 'Informe o valor',
                    validate: (v) =>
                      parseFloat(String(v)) > 0 || 'O valor deve ser positivo',
                  })}
                />
                {errors.value && (
                  <p className="text-xs text-destructive">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Informe a data' })}
                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: 'Selecione uma categoria' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-xs text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar transação'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
