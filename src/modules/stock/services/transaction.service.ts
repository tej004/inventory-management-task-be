import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransactionEntity } from '../../../database/entities/stock_transaction.entity';
import { ETransactionReason } from 'src/database/entities/enum/transaction.reason.enum';

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

  async getMonthlySalesStats(warehouseId?: string): Promise<{
    totalSalesThisMonth: number;
    growthPercent: number;
  }> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const thisMonthQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.type = :type', { type: 'OUT' })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction.timestamp_createdAt >= :start', {
        start: startOfThisMonth,
      })
      .leftJoin('transaction.stock', 'stock');

    if (warehouseId) {
      thisMonthQuery.andWhere('stock.warehouse = :warehouseId', {
        warehouseId,
      });
    }
    const thisMonthSales = await thisMonthQuery.getMany();

    const lastMonthQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.type = :type', { type: 'OUT' })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction.timestamp_createdAt >= :start', {
        start: startOfLastMonth,
      })
      .andWhere('transaction.timestamp_createdAt <= :end', {
        end: endOfLastMonth,
      })
      .leftJoin('transaction.stock', 'stock');

    if (warehouseId) {
      lastMonthQuery.andWhere('stock.warehouse = :warehouseId', {
        warehouseId,
      });
    }
    const lastMonthSales = await lastMonthQuery.getMany();

    const totalSalesThisMonth = thisMonthSales.reduce(
      (sum, t) => sum + t.quantity,
      0
    );
    const totalSalesLastMonth = lastMonthSales.reduce(
      (sum, t) => sum + t.quantity,
      0
    );
    let growthPercent = 0;
    if (totalSalesLastMonth > 0) {
      growthPercent =
        ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth) *
        100;
    } else if (totalSalesThisMonth > 0) {
      growthPercent = 100;
    }
    return { totalSalesThisMonth, growthPercent };
  }

  async getDailyWarehouseSalesChart(
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.stock', 'stock')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('transaction.type = :type', { type: 'OUT' })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction.timestamp_createdAt >= :start', { start })
      .andWhere('transaction.timestamp_createdAt <= :end', { end })
      .getMany();

    const salesMap: Record<string, Record<string, number>> = {};
    for (const tx of transactions) {
      const date = tx.timestamp?.createdAt?.toISOString().slice(0, 10);
      const warehouseCode = tx.stock?.warehouse?.code || 'unknown';
      if (!date) continue;
      if (!salesMap[date]) salesMap[date] = {};
      if (!salesMap[date][warehouseCode]) salesMap[date][warehouseCode] = 0;
      salesMap[date][warehouseCode] += tx.quantity;
    }

    return Object.entries(salesMap).map(([date, warehouseSales]) => ({
      date,
      ...warehouseSales,
    }));
  }
}
