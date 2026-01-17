import { StockTransactionEntity } from 'src/database/entities/stock_transaction.entity';

export class TransactionResponseDto {
  uuid: string;
  stockId: string;
  type: string;
  reason: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: StockTransactionEntity) {
    this.uuid = entity.uuid;
    this.stockId = entity.stockId;
    this.type = entity.type;
    this.reason = entity.reason;
    this.quantity = entity.quantity;
    this.createdAt = entity.timestamp?.createdAt;
    this.updatedAt = entity.timestamp?.updatedAt;
  }
}
