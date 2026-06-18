'use client';

import { cn } from '@/lib/utils';
import type { DashboardQuery } from '@/types';

interface PeriodFilterProps {
  value: DashboardQuery;
  onChange: (query: DashboardQuery) => void;
}

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildPresets(): { id: string; label: string; query: DashboardQuery }[] {
  const now = new Date();
  const today = ymd(now);
  const startOfMonth = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const startOfYear = ymd(new Date(now.getFullYear(), 0, 1));
  const last90 = ymd(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));

  return [
    { id: 'all', label: 'Tudo', query: {} },
    { id: 'month', label: 'Este mês', query: { startDate: startOfMonth, endDate: today } },
    { id: '90d', label: '90 dias', query: { startDate: last90, endDate: today } },
    { id: 'year', label: 'Este ano', query: { startDate: startOfYear, endDate: today } },
  ];
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const presets = buildPresets();
  const current = JSON.stringify(value);

  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-card p-1">
      {presets.map((preset) => {
        const active = JSON.stringify(preset.query) === current;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.query)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
