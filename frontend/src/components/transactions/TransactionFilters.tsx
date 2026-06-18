'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import type { TransactionType } from '@/types';

export const PERIODS = [
  { value: 'all', label: 'Todo o período' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
] as const;

interface TransactionFiltersProps {
  type: 'all' | TransactionType;
  categoryId: string;
  period: string;
  onTypeChange: (value: 'all' | TransactionType) => void;
  onCategoryChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

export function TransactionFilters({
  type,
  categoryId,
  period,
  onTypeChange,
  onCategoryChange,
  onPeriodChange,
}: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={type} onValueChange={(v) => onTypeChange(v as 'all' | TransactionType)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[190px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[170px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
