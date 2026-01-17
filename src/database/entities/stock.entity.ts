import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { WarehouseEntity } from './warehouse.entity';
import { TimestampEntity } from './common/timestamp.entity';
import { DeletionEntity } from './common/deletion.entity';

@Entity('stocks')
@Unique(['product', 'warehouse'])
export class StockEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ManyToOne(() => ProductEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @ManyToOne(() => WarehouseEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: WarehouseEntity;

  @Column({ type: 'int', default: 0, nullable: false })
  quantity: number;

  @Column(() => DeletionEntity, { prefix: false })
  deletion: DeletionEntity;

  @Column(() => TimestampEntity, { prefix: false })
  timestamp: TimestampEntity;
}
