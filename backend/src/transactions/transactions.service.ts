import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransactionDto,
  FilterTransactionDto,
  PaginatedResult,
  UpdateTransactionDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...dto,
        value: new Prisma.Decimal(dto.value),
        date: new Date(dto.date),
        userId,
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, filters: FilterTransactionDto): Promise<PaginatedResult<unknown>> {
    const { type, categoryId, startDate, endDate, page = 1, limit = 10 } = filters;

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...((startDate ?? endDate) && {
        date: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const lastPage = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: { total, page, limit, lastPage, hasNextPage: page < lastPage },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId)
      throw new ForbiddenException('Access denied');
    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.value !== undefined && { value: new Prisma.Decimal(dto.value) }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
