import { StockEntity } from '../../../../database/entities/stock.entity';

export class StockResponseDto {
  uuid: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  deletedAt: Date | null;
  isDeleted: boolean;

  product?: {
    uuid: string;
    sku: string;
    name: string;
    category: string;
    unitCost: number;
    reorderPoint: number;
  };
  warehouse?: {
    uuid: string;
    name: string;
    location: string;
    code: string;
  };

  constructor(entity: StockEntity) {
    this.uuid = entity.uuid;
    this.productId = entity.product?.uuid;
    this.warehouseId = entity.warehouse?.uuid;
    this.quantity = entity.quantity;
    this.createdAt = entity.timestamp.createdAt;
    this.updatedAt = entity.timestamp.updatedAt;
    this.deletedAt = entity.deletion?.deletedAt ?? null;
    this.isDeleted = entity.deletion?.isDeleted ?? false;
    if (entity.product) {
      this.product = {
        uuid: entity.product.uuid,
        sku: entity.product.sku,
        name: entity.product.name,
        category: entity.product.category,
        unitCost: Number(entity.product.unitCost),
        reorderPoint: entity.product.reorderPoint,
      };
    }
    if (entity.warehouse) {
      this.warehouse = {
        uuid: entity.warehouse.uuid,
        name: entity.warehouse.name,
        location: entity.warehouse.location,
        code: entity.warehouse.code,
      };
    }
  }
}
