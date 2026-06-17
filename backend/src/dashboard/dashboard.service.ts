import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

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
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getStats(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DashboardStats> {
    const [totalIncome, totalExpense, topExpenseCategories] = await Promise.all([
      this.sumByType(userId, TransactionType.INCOME, startDate, endDate),
      this.sumByType(userId, TransactionType.EXPENSE, startDate, endDate),
      this.getTopExpenseCategories(userId, startDate, endDate),
    ]);

    const balance = (parseFloat(totalIncome) - parseFloat(totalExpense)).toFixed(2);

    return { balance, totalIncome, totalExpense, topExpenseCategories };
  }

  private async sumByType(
    userId: string,
    type: TransactionType,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.value), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type });

    if (startDate) qb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.date <= :endDate', { endDate });

    const result = await qb.getRawOne<{ total: string }>();
    return parseFloat(result?.total ?? '0').toFixed(2);
  }

  private async getTopExpenseCategories(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TopCategory[]> {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('SUM(t.value)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('total', 'DESC')
      .limit(3);

    if (startDate) qb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.date <= :endDate', { endDate });

    const rows = await qb.getRawMany<{
      categoryId: string;
      categoryName: string;
      total: string;
    }>();

    return rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      total: parseFloat(r.total).toFixed(2),
    }));
  }
}
