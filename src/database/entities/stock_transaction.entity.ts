import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockEntity } from './stock.entity';
import { DeletionEntity } from './common/deletion.entity';
import { TimestampEntity } from './common/timestamp.entity';
import { ETransactionType } from './enum/transaction.type.enum';
import { ETransactionReason } from './enum/transaction.reason.enum';

@Entity('stock_transactions')
export class StockTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => StockEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stockId' })
  stock: StockEntity;

  @Column({ type: 'uuid' })
  stockId: string;

  @Column({
    type: 'enum',
    enum: ETransactionType,
    default: ETransactionType.IN,
    nullable: false,
  })
  type: ETransactionType;

  @Column({
    type: 'enum',
    enum: ETransactionReason,
    default: ETransactionReason.RESTOCK,
    nullable: false,
  })
  reason: ETransactionReason;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column(() => DeletionEntity, { prefix: false })
  deletion: DeletionEntity;

  @Column(() => TimestampEntity, { prefix: false })
  timestamp: TimestampEntity;
}
