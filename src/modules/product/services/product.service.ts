import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../../database/entities/product.entity';
import { CreateProductDto } from '../dtos/requests/create-product.dto';
import { UpdateProductDto } from '../dtos/requests/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const dto = { ...createProductDto };

    if (dto.category) {
      dto.category = dto.category.toLowerCase();
    }

    const sameProductSku = await this.productRepository.findOne({
      where: {
        sku: dto.sku,
      },
    });

    if (sameProductSku) throw new ForbiddenException('SKU already exist');

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { deletion: { isDeleted: false } },
    });
  }

  async findOne(uuid: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { uuid, deletion: { isDeleted: false } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    uuid: string,
    updateProductDto: UpdateProductDto
  ): Promise<ProductEntity> {
    const product = await this.findOne(uuid);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existing && existing.uuid !== uuid) {
        throw new ForbiddenException('SKU already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(uuid: string): Promise<void> {
    const product = await this.findOne(uuid);
    await this.productRepository.remove(product);
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
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.productRepository.createQueryBuilder('product');
    if (deletedOnly) {
      query.where('product.deletion.isDeleted = :isDeleted', {
        isDeleted: true,
      });
    } else if (!includeDeleted) {
      query.where('product.deletion.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    }
    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.category ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }
    query.addOrderBy('product.timestamp.createdAt', 'DESC');
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

    const total = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.deletion', 'deletion')
      .leftJoin('product.timestamp', 'timestamp')
      .where('deletion.isDeleted = :isDeleted', { isDeleted: deleted })
      .andWhere('timestamp.createdAt >= :start', { start: startOfThisMonth })
      .getCount();

    const lastMonthTotal = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.deletion', 'deletion')
      .leftJoin('product.timestamp', 'timestamp')
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
