import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    transaction: { aggregate: jest.Mock; groupBy: jest.Mock };
    category: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('should calculate balance, totalIncome and totalExpense correctly', async () => {
      prisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { value: new Prisma.Decimal('500.00') } })
        .mockResolvedValueOnce({ _sum: { value: new Prisma.Decimal('200.00') } });

      prisma.transaction.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _sum: { value: new Prisma.Decimal('150.00') } },
        { categoryId: 'cat-2', _sum: { value: new Prisma.Decimal('50.00') } },
      ]);

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Food' },
        { id: 'cat-2', name: 'Transport' },
      ]);

      const result = await service.getStats('user-uuid');

      expect(result.totalIncome).toBe('500.00');
      expect(result.totalExpense).toBe('200.00');
      expect(result.balance).toBe('300.00');
      expect(result.topExpenseCategories).toHaveLength(2);
      expect(result.topExpenseCategories[0].categoryName).toBe('Food');
    });

    it('should return zero balance when there are no transactions', async () => {
      prisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { value: null } })
        .mockResolvedValueOnce({ _sum: { value: null } });

      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.category.findMany.mockResolvedValue([]);

      const result = await service.getStats('user-uuid');

      expect(result.balance).toBe('0.00');
      expect(result.totalIncome).toBe('0.00');
      expect(result.totalExpense).toBe('0.00');
      expect(result.topExpenseCategories).toHaveLength(0);
    });

    it('should return negative balance when expenses exceed income', async () => {
      prisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { value: new Prisma.Decimal('100.00') } })
        .mockResolvedValueOnce({ _sum: { value: new Prisma.Decimal('350.00') } });

      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.category.findMany.mockResolvedValue([]);

      const result = await service.getStats('user-uuid');

      expect(result.balance).toBe('-250.00');
    });
  });
});
