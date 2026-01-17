import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TimestampEntity } from './common/timestamp.entity';
import { EApprovalStatus } from './enum/approval.status.enum';
import { WarehouseEntity } from './warehouse.entity';
import { ProductEntity } from './product.entity';
import { DeletionEntity } from './common/deletion.entity';

@Entity('transfers')
export class TransferEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => WarehouseEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromWarehouseId' })
  fromWarehouse: WarehouseEntity;

  @Column({ type: 'uuid' })
  fromWarehouseId: string;

  @ManyToOne(() => WarehouseEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toWarehouseId' })
  toWarehouse: WarehouseEntity;

  @Column({ type: 'uuid' })
  toWarehouseId: string;

  @ManyToOne(() => ProductEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: EApprovalStatus,
    default: EApprovalStatus.PENDING,
  })
  approvalStatus: EApprovalStatus;

  @Column(() => DeletionEntity, { prefix: false })
  deletion: DeletionEntity;

  @Column(() => TimestampEntity, { prefix: false })
  timestamp: TimestampEntity;
}
