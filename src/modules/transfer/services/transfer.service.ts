import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransferEntity } from '../../../database/entities/transfer.entity';
import { StockEntity } from '../../../database/entities/stock.entity';
import { CreateTransferDto } from '../dtos/requests/create-transfer.dto';
import { EApprovalStatus } from '../../../database/entities/enum/approval.status.enum';

@Injectable()
export class TransferService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createTransferDto: CreateTransferDto): Promise<TransferEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const sourceStock = await manager.findOne(StockEntity, {
        where: {
          product: { uuid: createTransferDto.productId },
          warehouse: { uuid: createTransferDto.fromWarehouseId },
          deletion: { isDeleted: false },
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!sourceStock || sourceStock.quantity < createTransferDto.quantity) {
        throw new BadRequestException('Insufficient stock for transfer');
      }

      if (createTransferDto.fromWarehouseId === createTransferDto.toWarehouseId)
        throw new BadRequestException(
          'Same recipient and destination warehouse'
        );

      sourceStock.quantity -= createTransferDto.quantity;
      await manager.save(sourceStock);

      const transfer = manager.create(TransferEntity, {
        ...createTransferDto,
        approvalStatus: EApprovalStatus.PENDING,
      });
      return await manager.save(transfer);
    });
  }

  async receive(uuid: string): Promise<TransferEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(TransferEntity, {
        where: { uuid, approvalStatus: EApprovalStatus.PENDING },
        lock: { mode: 'pessimistic_write' },
      });
      if (!transfer)
        throw new NotFoundException('Transfer not found or already received');

      let destStock = await manager.findOne(StockEntity, {
        where: {
          product: { uuid: transfer.productId },
          warehouse: { uuid: transfer.toWarehouseId },
          deletion: { isDeleted: false },
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!destStock) {
        destStock = manager.create(StockEntity, {
          product: { uuid: transfer.productId } as any,
          warehouse: { uuid: transfer.toWarehouseId } as any,
          quantity: 0,
        });
      }
      destStock.quantity += transfer.quantity;
      await manager.save(destStock);

      transfer.approvalStatus = EApprovalStatus.RECEIVED;
      return await manager.save(transfer);
    });
  }

  async approve(uuid: string): Promise<TransferEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(TransferEntity, {
        where: { uuid, approvalStatus: EApprovalStatus.PENDING },
        lock: { mode: 'pessimistic_write' },
      });
      if (!transfer)
        throw new NotFoundException('Transfer not found or not pending');
      transfer.approvalStatus = EApprovalStatus.APPROVED;
      return await manager.save(transfer);
    });
  }

  async decline(uuid: string): Promise<TransferEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const transfer = await manager.findOne(TransferEntity, {
        where: { uuid, approvalStatus: EApprovalStatus.PENDING },
        lock: { mode: 'pessimistic_write' },
      });
      if (!transfer)
        throw new NotFoundException('Transfer not found or not pending');

      const sourceStock = await manager.findOne(StockEntity, {
        where: {
          product: { uuid: transfer.productId },
          warehouse: { uuid: transfer.fromWarehouseId },
          deletion: { isDeleted: false },
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!sourceStock) throw new NotFoundException('Source stock not found');
      sourceStock.quantity += transfer.quantity;
      await manager.save(sourceStock);

      transfer.approvalStatus = EApprovalStatus.REJECTED;
      return await manager.save(transfer);
    });
  }

  async getPendingTransfersTotalValue(): Promise<number> {
    const transfers = await this.dataSource.getRepository(TransferEntity).find({
      where: { approvalStatus: EApprovalStatus.PENDING },
      relations: ['product'],
    });
    let total = 0;
    for (const transfer of transfers) {
      if (transfer.product && typeof transfer.product.unitCost === 'number') {
        total += transfer.quantity * transfer.product.unitCost;
      } else {
        total += transfer.quantity;
      }
    }
    return total;
  }

  async paginatedFind({
    page = 1,
    limit = 10,
    productId,
    fromWarehouseId,
    toWarehouseId,
    approvalStatus,
  }: {
    page?: number;
    limit?: number;
    productId?: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    approvalStatus?: string;
  }): Promise<{
    data: TransferEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.dataSource
      .getRepository(TransferEntity)
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.product', 'product')
      .leftJoinAndSelect('transfer.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transfer.toWarehouse', 'toWarehouse')
      .addOrderBy('transfer.timestamp.createdAt', 'DESC');

    if (productId) {
      query.andWhere('product.uuid = :productId', { productId });
    }
    if (fromWarehouseId) {
      query.andWhere('fromWarehouse.uuid = :fromWarehouseId', {
        fromWarehouseId,
      });
    }
    if (toWarehouseId) {
      query.andWhere('toWarehouse.uuid = :toWarehouseId', { toWarehouseId });
    }
    if (approvalStatus) {
      query.andWhere('transfer.approvalStatus = :approvalStatus', {
        approvalStatus,
      });
    }
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }
}
