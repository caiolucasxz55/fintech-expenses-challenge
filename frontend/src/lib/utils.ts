import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Valor da API (string Decimal) → moeda BRL. */
export function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

/** Data ISO (YYYY-MM-DD ou completa) → "16 de jun. de 2026". */
export function formatDate(value: string): string {
  const iso = value.length <= 10 ? `${value}T00:00:00Z` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
