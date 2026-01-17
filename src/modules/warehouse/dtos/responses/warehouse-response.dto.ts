import { WarehouseEntity } from '../../../../database/entities/warehouse.entity';

export class WarehouseResponseDto {
  uuid: string;
  name: string;
  location: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean;

  constructor(entity: WarehouseEntity) {
    this.uuid = entity.uuid;
    this.name = entity.name;
    this.location = entity.location;
    this.code = entity.code;
    this.createdAt = entity.timestamp.createdAt;
    this.updatedAt = entity.timestamp.updatedAt;
    this.deletedAt = entity.deletion?.deletedAt ?? null;
    this.isDeleted = entity.deletion?.isDeleted ?? false;
  }
}
