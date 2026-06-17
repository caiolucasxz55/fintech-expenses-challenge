import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  total: string;
}

export interface DashboardStats {
  balance: string;
  totalIncome: string;
  totalExpense: string;
  topExpenseCategories: TopCategory[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DashboardStats> {
    const dateFilter: Prisma.TransactionWhereInput =
      startDate ?? endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {};

    const baseWhere: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...dateFilter,
    };

    const [incomeAgg, expenseAgg, topGroups] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...baseWhere, type: TransactionType.income },
        _sum: { value: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...baseWhere, type: TransactionType.expense },
        _sum: { value: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...baseWhere, type: TransactionType.expense },
        _sum: { value: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 3,
      }),
    ]);

    const totalIncome = (
      incomeAgg._sum.value ?? new Prisma.Decimal(0)
    ).toFixed(2);
    const totalExpense = (
      expenseAgg._sum.value ?? new Prisma.Decimal(0)
    ).toFixed(2);
    const balance = (
      parseFloat(totalIncome) - parseFloat(totalExpense)
    ).toFixed(2);

    const categoryIds = topGroups.map((g) => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = Object.fromEntries(
      categories.map((c) => [c.id, c.name]),
    );

    const topExpenseCategories: TopCategory[] = topGroups.map((g) => ({
      categoryId: g.categoryId,
      categoryName: categoryMap[g.categoryId] ?? 'Unknown',
      total: (g._sum.value ?? new Prisma.Decimal(0)).toFixed(2),
    }));

    return { balance, totalIncome, totalExpense, topExpenseCategories };
  }
}
