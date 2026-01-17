import { StockTransactionEntity } from 'src/database/entities/stock_transaction.entity';

export class TransactionResponseDto {
  uuid: string;
  stockId: string;
  type: string;
  reason: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  stock?: any;
  product?: any;
  warehouse?: any;

  constructor(entity: StockTransactionEntity) {
    this.uuid = entity.uuid;
    this.stockId = entity.stockId;
    this.type = entity.type;
    this.reason = entity.reason;
    this.quantity = entity.quantity;
    this.createdAt = entity.timestamp?.createdAt;
    this.updatedAt = entity.timestamp?.updatedAt;

    if (entity.stock) {
      this.stock = {
        uuid: entity.stock.uuid,
        quantity: entity.stock.quantity,
      };
      if (entity.stock.product) {
        this.product = {
          uuid: entity.stock.product.uuid,
          name: entity.stock.product.name,
          category: entity.stock.product.category,
        };
      }
      if (entity.stock.warehouse) {
        this.warehouse = {
          uuid: entity.stock.warehouse.uuid,
          name: entity.stock.warehouse.name,
          code: entity.stock.warehouse.code,
        };
      }
    }
  }
}
