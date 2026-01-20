import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockTransactionEntity } from '../../../database/entities/stock_transaction.entity';
import { ETransactionReason } from 'src/database/entities/enum/transaction.reason.enum';
import { StockEntity } from 'src/database/entities/stock.entity';
import { ETransactionType } from 'src/database/entities/enum/transaction.type.enum';
import { CreateTransactionDto } from '../dtos/requests/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/requests/update-transaction.dto';
import { WarehouseEntity } from 'src/database/entities/warehouse.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(StockTransactionEntity)
    private readonly transactionRepository: Repository<StockTransactionEntity>,
    private readonly dataSource: DataSource
  ) {}

  async create(
    data: Partial<CreateTransactionDto>
  ): Promise<StockTransactionEntity> {
    return this.dataSource.transaction(async (manager) => {
      const stock = await manager.findOne(StockEntity, {
        where: { uuid: data.stockId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!stock) throw new BadRequestException('Stock not found');

      if (typeof data.quantity !== 'number')
        throw new BadRequestException('Quantity is not a number');

      if (data.type === ETransactionType.OUT) {
        if (stock.quantity - data.quantity < 0) {
          throw new BadRequestException(
            'Stock quantity cannot go negative for OUT adjustment'
          );
        }

        stock.quantity -= data.quantity;
      } else if (data.type === ETransactionType.IN) {
        stock.quantity += data.quantity;
      }
      await manager.save(stock);

      const transaction = manager.create(StockTransactionEntity, data);
      return manager.save(transaction);
    });
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
    data: Partial<UpdateTransactionDto>
  ): Promise<StockTransactionEntity> {
    return this.dataSource.transaction(async (manager) => {
      const transaction = await manager.findOne(StockTransactionEntity, {
        where: { uuid },
      });
      if (!transaction) throw new NotFoundException('Transaction not found');

      // Prevent stockId update
      if (data.stockId && data.stockId !== transaction.stockId) {
        throw new BadRequestException(
          'Updating stockId in a transaction record is not allowed'
        );
      }

      // Only allow update on the latest transaction for this stock
      const latestTx = await manager.findOne(StockTransactionEntity, {
        where: { stockId: transaction.stockId },
        order: { timestamp: { createdAt: 'DESC' } },
      });
      if (!latestTx || latestTx.uuid !== transaction.uuid) {
        throw new BadRequestException(
          'Only the latest transaction for this stock can be updated'
        );
      }

      // If quantity/type changed, update stock accordingly
      const stockId = transaction.stockId;
      const typeChanged = data.type && data.type !== transaction.type;
      const quantityChanged =
        typeof data.quantity === 'number' &&
        data.quantity !== transaction.quantity;

      if (typeChanged || quantityChanged) {
        // Revert previous effect on stock
        const stock = await manager.findOne(StockEntity, {
          where: { uuid: stockId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!stock) throw new BadRequestException('Stock not found');
        if (typeof transaction.quantity === 'number') {
          if (transaction.type === ETransactionType.OUT) {
            stock.quantity += transaction.quantity;
          } else if (transaction.type === ETransactionType.IN) {
            stock.quantity -= transaction.quantity;
          }
        }
        // Apply new effect
        const newType = data.type || transaction.type;
        const newQuantity =
          typeof data.quantity === 'number'
            ? data.quantity
            : transaction.quantity;
        if (typeof newQuantity === 'number') {
          if (newType === ETransactionType.OUT) {
            if (stock.quantity - newQuantity < 0) {
              throw new BadRequestException(
                'Stock quantity cannot go negative for OUT adjustment'
              );
            }
            stock.quantity -= newQuantity;
          } else if (newType === ETransactionType.IN) {
            stock.quantity += newQuantity;
          }
        }
        await manager.save(stock);
      }

      Object.assign(transaction, data);
      return manager.save(transaction);
    });
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
      .leftJoinAndSelect('transaction.stock', 'stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.warehouse', 'warehouse');
    if (productId) {
      query.andWhere('product.uuid = :productId', { productId });
    }
    if (warehouseId) {
      query.andWhere('warehouse.uuid = :warehouseId', { warehouseId });
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
      .where('transaction.type = :type', { type: ETransactionType.OUT })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction."createdAt" >= :start', {
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
      .where('transaction.type = :type', { type: ETransactionType.OUT })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction."createdAt" >= :start', {
        start: startOfLastMonth,
      })
      .andWhere('transaction."createdAt" <= :end', {
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

    // Get all warehouses
    const warehouseRepo = this.dataSource.getRepository(WarehouseEntity);
    const warehouses = await warehouseRepo.find();
    const warehouseCodes = warehouses.map((w: any) => w.code);

    // Get all transactions in range
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.stock', 'stock')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('transaction.type = :type', { type: ETransactionType.OUT })
      .andWhere('transaction.reason = :reason', {
        reason: ETransactionReason.SALE,
      })
      .andWhere('transaction."createdAt" >= :start', { start })
      .andWhere('transaction."createdAt" <= :end', { end })
      .getMany();

    // Build sales map
    const salesMap: Record<string, Record<string, number>> = {};
    for (const tx of transactions) {
      const date = tx.timestamp?.createdAt?.toISOString().slice(0, 10);
      const warehouseCode = tx.stock?.warehouse?.code || 'unknown';
      if (!date) continue;
      if (!salesMap[date]) salesMap[date] = {};
      if (!salesMap[date][warehouseCode]) salesMap[date][warehouseCode] = 0;
      salesMap[date][warehouseCode] += tx.quantity;
    }

    // Generate all dates in range
    const allDates: string[] = [];
    let d = new Date(start);
    while (d <= end) {
      allDates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }

    const result: any[] = [];
    for (const date of allDates) {
      const warehouseSales: Record<string, number> = {};
      for (const code of warehouseCodes) {
        warehouseSales[code] = salesMap[date]?.[code] || 0;
      }
      result.push({ date, ...warehouseSales });
    }
    return result;
  }
}
