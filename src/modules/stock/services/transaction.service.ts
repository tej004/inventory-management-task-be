import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransactionEntity } from '../../../database/entities/stock_transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(StockTransactionEntity)
    private readonly transactionRepository: Repository<StockTransactionEntity>
  ) {}

  async create(
    data: Partial<StockTransactionEntity>
  ): Promise<StockTransactionEntity> {
    const transaction = this.transactionRepository.create(data);
    return this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<StockTransactionEntity[]> {
    return this.transactionRepository.find();
  }

  async findOne(uuid: string): Promise<StockTransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { uuid },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async update(
    uuid: string,
    data: Partial<StockTransactionEntity>
  ): Promise<StockTransactionEntity> {
    const transaction = await this.findOne(uuid);
    Object.assign(transaction, data);
    return this.transactionRepository.save(transaction);
  }

  async remove(uuid: string): Promise<void> {
    const transaction = await this.findOne(uuid);
    await this.transactionRepository.remove(transaction);
  }

  async paginatedFind({
    page = 1,
    limit = 10,
    productId,
    warehouseId,
  }: {
    page?: number;
    limit?: number;
    productId?: string;
    warehouseId?: string;
  }): Promise<{
    data: StockTransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.stock', 'stock');
    if (productId) {
      query.andWhere('stock.product = :productId', { productId });
    }
    if (warehouseId) {
      query.andWhere('stock.warehouse = :warehouseId', { warehouseId });
    }
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }
}
