import { ProductEntity } from '../../../../database/entities/product.entity';

export class ProductResponseDto {
  uuid: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  reorderPoint: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(entity: ProductEntity) {
    this.uuid = entity.uuid;
    this.sku = entity.sku;
    this.name = entity.name;
    this.category = entity.category;
    this.unitCost = Number(entity.unitCost);
    this.reorderPoint = entity.reorderPoint;
    this.deletedAt = entity.deletion?.deletedAt ?? null;
    this.isDeleted = entity.deletion?.isDeleted ?? false;
    this.createdAt = entity.timestamp.createdAt;
    this.updatedAt = entity.timestamp.updatedAt;
  }
}
