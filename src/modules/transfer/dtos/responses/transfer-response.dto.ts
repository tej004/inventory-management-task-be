import { TransferEntity } from '../../../../database/entities/transfer.entity';

export class TransferResponseDto {
  uuid: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: TransferEntity) {
    this.uuid = entity.uuid;
    this.productId = entity.product?.uuid;
    this.fromWarehouseId = entity.fromWarehouse?.uuid;
    this.toWarehouseId = entity.toWarehouse?.uuid;
    this.quantity = entity.quantity;
    this.status = entity.status;
    this.createdAt = entity.timestamp.createdAt;
    this.updatedAt = entity.timestamp.updatedAt;
  }
}
