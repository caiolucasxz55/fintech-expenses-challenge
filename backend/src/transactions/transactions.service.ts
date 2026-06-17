import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTransactionDto,
  FilterTransactionDto,
  PaginatedResult,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({ ...dto, userId });
    return this.transactionRepository.save(transaction);
  }

  async findAll(
    userId: string,
    filters: FilterTransactionDto,
  ): Promise<PaginatedResult<Transaction>> {
    const { type, categoryId, startDate, endDate, page = 1, limit = 10 } =
      filters;

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId })
      .orderBy('t.date', 'DESC')
      .addOrderBy('t.createdAt', 'DESC');

    if (type) qb.andWhere('t.type = :type', { type });
    if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
    if (startDate) qb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.date <= :endDate', { endDate });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const lastPage = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: { total, page, limit, lastPage, hasNextPage: page < lastPage },
    };
  }

  async findOne(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId)
      throw new ForbiddenException('Access denied');
    return transaction;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(userId, id);
    Object.assign(transaction, dto);
    return this.transactionRepository.save(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.findOne(userId, id);
    await this.transactionRepository.softRemove(transaction);
  }
}
