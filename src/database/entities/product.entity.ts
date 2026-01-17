import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TimestampEntity } from './common/timestamp.entity';
import { DeletionEntity } from './common/deletion.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ unique: true, nullable: false })
  sku: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'int' })
  reorderPoint: number;

  @Column(() => DeletionEntity, { prefix: false })
  deletion: DeletionEntity;

  @Column(() => TimestampEntity, { prefix: false })
  timestamp: TimestampEntity;
}
