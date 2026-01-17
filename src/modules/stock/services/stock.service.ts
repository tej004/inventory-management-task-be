import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockEntity } from '../../../database/entities/stock.entity';
import { CreateStockDto } from '../dtos/requests/create-stock.dto';
import { UpdateStockDto } from '../dtos/requests/update-stock.dto';
import { TransferService } from 'src/modules/transfer/services/transfer.service';
import { StockStatusPieDto } from '../dtos/responses/stock-status-pie.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
    private readonly transferService: TransferService
  ) {}

  async create(createStockDto: CreateStockDto): Promise<StockEntity> {
    const stock = this.stockRepository.create({
      ...createStockDto,
      product: { uuid: createStockDto.productId } as any,
      warehouse: { uuid: createStockDto.warehouseId } as any,
    });
    return this.stockRepository.save(stock);
  }

  async findAll(): Promise<StockEntity[]> {
    return this.stockRepository.find({
      where: { deletion: { isDeleted: false } },
      relations: ['product', 'warehouse'],
    });
  }

  async findOne(uuid: string): Promise<StockEntity> {
    const stock = await this.stockRepository.findOne({
      where: { uuid, deletion: { isDeleted: false } },
      relations: ['product', 'warehouse'],
    });
    if (!stock) throw new NotFoundException('Stock not found');
    return stock;
  }

  async update(
    uuid: string,
    updateStockDto: UpdateStockDto
  ): Promise<StockEntity> {
    const stock = await this.findOne(uuid);
    Object.assign(stock, updateStockDto);
    return this.stockRepository.save(stock);
  }

  async remove(uuid: string): Promise<void> {
    const stock = await this.findOne(uuid);
    await this.stockRepository.remove(stock);
  }

  async paginatedFind({
    page = 1,
    limit = 10,
    search = '',
    includeDeleted = false,
    deletedOnly = false,
    category,
    status,
    warehouse,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    deletedOnly?: boolean;
    category?: string;
    status?: 'inStock' | 'lowStock';
    warehouse?: string;
  }): Promise<{
    data: StockEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.warehouse', 'warehouse');

    // filters
    if (deletedOnly) {
      query.where('stock.deletion.isDeleted = :isDeleted', { isDeleted: true });
    } else if (!includeDeleted) {
      query.where('stock.deletion.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    }
    if (search) {
      query.andWhere(
        'product.name ILIKE :search OR warehouse.name ILIKE :search',
        { search: `%${search}%` }
      );
    }
    if (category) {
      query.andWhere('product.category = :category', {
        category: category.toLowerCase(),
      });
    }
    if (warehouse) {
      query.andWhere('warehouse.uuid = :warehouse', { warehouse });
    }
    if (status === 'inStock') {
      query.andWhere('product.reorderPoint < stock.quantity');
    } else if (status === 'lowStock') {
      query.andWhere('product.reorderPoint >= stock.quantity');
    }

    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async getTotalStockAndPendingTransferValue(): Promise<number> {
    const stocks = await this.stockRepository.find({ relations: ['product'] });
    let stockValue = 0;
    for (const stock of stocks) {
      if (stock.product && typeof stock.product.unitCost === 'number') {
        stockValue += stock.quantity * stock.product.unitCost;
      } else {
        stockValue += stock.quantity;
      }
    }
    const pendingTransferValue =
      await this.transferService.getPendingTransfersTotalValue();
    return stockValue + pendingTransferValue;
  }

  async getRefillStats(): Promise<{
    uniqueProducts: number;
    needRefill: Array<{ stock: StockEntity; reorderPoint: number }>;
    totalToRefill: number;
  }> {
    const qb = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('product.reorderPoint IS NOT NULL')
      .andWhere('stock.quantity <= product.reorderPoint');

    const needRefill = await qb.getMany();

    let totalToRefill = 0;
    const uniqueProductUuids = new Set<string>();
    for (const stock of needRefill) {
      if (stock.product?.uuid) uniqueProductUuids.add(stock.product.uuid);
      const reorderPoint = stock.product?.reorderPoint;
      if (typeof reorderPoint === 'number') {
        totalToRefill += reorderPoint - stock.quantity;
      }
    }

    return {
      uniqueProducts: uniqueProductUuids.size,
      needRefill: needRefill.map((stock) => ({
        stock,
        reorderPoint: stock.product?.reorderPoint ?? 0,
      })),
      totalToRefill,
    };
  }

  async getStockStatusPieData(
    warehouse?: string
  ): Promise<StockStatusPieDto[]> {
    const query = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.product', 'product')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('product.reorderPoint IS NOT NULL')
      .andWhere('stock.deletion.isDeleted = false');

    if (warehouse) {
      query.andWhere('warehouse.uuid = :warehouse', { warehouse });
    }

    const stocks = await query.getMany();

    let inStockCount = 0;
    let lowStockCount = 0;
    for (const stock of stocks) {
      if (!stock.product || typeof stock.product.reorderPoint !== 'number')
        continue;
      if (stock.product.reorderPoint < stock.quantity) {
        inStockCount++;
      } else {
        lowStockCount++;
      }
    }

    return [
      { status: 'inStock', value: inStockCount },
      { status: 'lowStock', value: lowStockCount },
    ];
  }

  async getProductsByQuantityOrder({
    limit = 5,
    warehouse,
    order = 'DESC',
  }: {
    limit?: number;
    warehouse?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<
    Array<{ productId: string; productName: string; totalQuantity: number }>
  > {
    const query = this.stockRepository
      .createQueryBuilder('stock')
      .leftJoin('stock.product', 'product')
      .select('product.uuid', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(stock.quantity)', 'totalQuantity')
      .where('stock.deletion.isDeleted = false')
      .andWhere('product.uuid IS NOT NULL');
    if (warehouse) {
      query.andWhere('stock.warehouse = :warehouse', { warehouse });
    }
    query.groupBy('product.uuid').addGroupBy('product.name');
    query.orderBy('totalQuantity', order);
    query.limit(limit);
    const result = await query.getRawMany();
    return result.map((row: any) => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantity: Number(row.totalQuantity),
    }));
  }
}
