/** Domínio do dashboard — reflete DashboardModule (cálculo feito na API). */

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  /** Total de saídas da categoria; string (Prisma Decimal). */
  total: string;
}

export interface DashboardStats {
  balance: string;
  totalIncome: string;
  totalExpense: string;
  topExpenseCategories: TopCategory[];
}

/** Período opcional para GET /dashboard. */
export interface DashboardQuery {
  startDate?: string;
  endDate?: string;
}
