import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: { transaction: Record<string, jest.Mock>; $transaction: jest.Mock };

  const mockTransaction = {
    id: 'tx-uuid',
    description: 'Office lunch',
    value: new Prisma.Decimal('100.00'),
    type: TransactionType.expense,
    date: new Date('2024-01-15'),
    userId: 'user-uuid',
    categoryId: 'cat-uuid',
    category: { id: 'cat-uuid', name: 'Food' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    it('should create and return a transaction', async () => {
      prisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create('user-uuid', {
        description: 'Office lunch',
        value: '100.00',
        type: TransactionType.expense,
        date: '2024-01-15',
        categoryId: 'cat-uuid',
      });

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions for the user', async () => {
      prisma.$transaction.mockResolvedValue([1, [mockTransaction]]);

      const result = await service.findAll('user-uuid', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.lastPage).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return the transaction when found and owned by user', async () => {
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.findOne('user-uuid', 'tx-uuid');

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-uuid', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when transaction belongs to another user', async () => {
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);

      await expect(service.findOne('other-user-uuid', 'tx-uuid')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the modified transaction', async () => {
      const updated = { ...mockTransaction, description: 'Updated lunch' };
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue(updated);

      const result = await service.update('user-uuid', 'tx-uuid', {
        description: 'Updated lunch',
      });

      expect(result.description).toBe('Updated lunch');
    });

    it('should throw NotFoundException when updating a non-existent transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-uuid', 'non-existent', { description: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete by setting deletedAt', async () => {
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        deletedAt: new Date(),
      });

      await expect(service.remove('user-uuid', 'tx-uuid')).resolves.not.toThrow();
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tx-uuid' } }),
      );
    });

    it('should throw ForbiddenException when deleting a transaction from another user', async () => {
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);

      await expect(service.remove('other-user-uuid', 'tx-uuid')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
