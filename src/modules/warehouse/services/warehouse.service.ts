import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from '../../../database/entities/warehouse.entity';
import { CreateWarehouseDto } from '../dtos/requests/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dtos/requests/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepository: Repository<WarehouseEntity>
  ) {}

  async create(
    createWarehouseDto: CreateWarehouseDto
  ): Promise<WarehouseEntity> {
    const sameWarehouseCode = await this.warehouseRepository.findOne({
      where: {
        code: createWarehouseDto.code,
      },
    });

    if (sameWarehouseCode) throw new ForbiddenException('Code already exist');

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<WarehouseEntity[]> {
    return this.warehouseRepository.find({
      where: { deletion: { isDeleted: false } },
    });
  }

  async findOne(uuid: string): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { uuid, deletion: { isDeleted: false } },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(
    uuid: string,
    updateWarehouseDto: UpdateWarehouseDto
  ): Promise<WarehouseEntity> {
    const warehouse = await this.findOne(uuid);

    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existing = await this.warehouseRepository.findOne({
        where: {
          code: updateWarehouseDto.code,
        },
      });

      if (existing && existing.uuid !== uuid) {
        throw new ForbiddenException('Code already exist.');
      }
    }

    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(uuid: string): Promise<void> {
    const warehouse = await this.findOne(uuid);
    await this.warehouseRepository.remove(warehouse);
  }

  async paginatedFind({
    page = 1,
    limit = 10,
    search = '',
    includeDeleted = false,
    deletedOnly = false,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    deletedOnly?: boolean;
  }): Promise<{
    data: WarehouseEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.warehouseRepository.createQueryBuilder('warehouse');
    if (deletedOnly) {
      query.where('warehouse.deletion.isDeleted = :isDeleted', {
        isDeleted: true,
      });
    } else if (!includeDeleted) {
      query.where('warehouse.deletion.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    }
    if (search) {
      query.andWhere(
        'warehouse.name ILIKE :search OR warehouse.code ILIKE :search OR warehouse.location ILIKE :search',
        { search: `%${search}%` }
      );
    }
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async getTotalAndGrowth(
    deleted: boolean
  ): Promise<{ total: number; growth: number }> {
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

    // Current month count
    const total = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoin('warehouse.deletion', 'deletion')
      .leftJoin('warehouse.timestamp', 'timestamp')
      .where('deletion.isDeleted = :isDeleted', { isDeleted: deleted })
      .andWhere('timestamp.createdAt >= :start', { start: startOfThisMonth })
      .getCount();

    // Last month count
    const lastMonthTotal = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoin('warehouse.deletion', 'deletion')
      .leftJoin('warehouse.timestamp', 'timestamp')
      .where('deletion.isDeleted = :isDeleted', { isDeleted: deleted })
      .andWhere('timestamp.createdAt >= :start', { start: startOfLastMonth })
      .andWhere('timestamp.createdAt <= :end', { end: endOfLastMonth })
      .getCount();

    let growth = 0;
    if (lastMonthTotal > 0) {
      growth = ((total - lastMonthTotal) / lastMonthTotal) * 100;
    } else if (total > 0) {
      growth = 100;
    }
    return { total, growth };
  }
}
