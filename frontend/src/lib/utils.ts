import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário que chega da API como string (Prisma Decimal)
 * para o formato de moeda brasileiro (BRL).
 */
export function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

/** Formata uma data ISO (YYYY-MM-DD ou ISO completa) para dd/mm/aaaa. */
export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}
