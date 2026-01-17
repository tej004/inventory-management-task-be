import { TransferEntity } from '../../../../database/entities/transfer.entity';

export class TransferResponseDto {
  uuid: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  approvalStatus: string;
  createdAt: Date;
  updatedAt: Date;
  fromWarehouse?: any;
  toWarehouse?: any;
  product?: any;

  constructor(entity: TransferEntity) {
    this.uuid = entity.uuid;
    this.productId = entity.product?.uuid;
    this.fromWarehouseId = entity.fromWarehouse?.uuid;
    this.toWarehouseId = entity.toWarehouse?.uuid;
    this.quantity = entity.quantity;
    this.approvalStatus = entity.approvalStatus;
    this.createdAt = entity.timestamp.createdAt;
    this.updatedAt = entity.timestamp.updatedAt;

    if (entity.fromWarehouse) {
      this.fromWarehouse = {
        uuid: entity.fromWarehouse.uuid,
        name: entity.fromWarehouse.name,
        code: entity.fromWarehouse.code,
      };
    }
    if (entity.toWarehouse) {
      this.toWarehouse = {
        uuid: entity.toWarehouse.uuid,
        name: entity.toWarehouse.name,
        code: entity.toWarehouse.code,
      };
    }
    if (entity.product) {
      this.product = {
        uuid: entity.product.uuid,
        name: entity.product.name,
        category: entity.product.category,
        unitCost: entity.product.unitCost,
      };
    }
  }
}
