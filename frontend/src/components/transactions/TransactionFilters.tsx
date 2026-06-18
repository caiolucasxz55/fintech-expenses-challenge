'use client';

import { X } from 'lucide-react';
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
import type { TransactionFilters as Filters, TransactionType } from '@/types';

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

const ALL = 'all';

export function TransactionFilters({
  filters,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories();
  const hasActiveFilters = Boolean(
    filters.type || filters.categoryId || filters.startDate || filters.endDate,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="space-y-1.5">
        <Label className="text-xs">Tipo</Label>
        <Select
          value={filters.type ?? ALL}
          onValueChange={(v) =>
            onChange({ type: v === ALL ? undefined : (v as TransactionType) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="income">Entrada</SelectItem>
            <SelectItem value="expense">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Categoria</Label>
        <Select
          value={filters.categoryId ?? ALL}
          onValueChange={(v) =>
            onChange({ categoryId: v === ALL ? undefined : v })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">De</Label>
        <Input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => onChange({ startDate: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Até</Label>
        <Input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => onChange({ endDate: e.target.value || undefined })}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="justify-self-start">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
