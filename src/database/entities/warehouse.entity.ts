import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TimestampEntity } from './common/timestamp.entity';
import { DeletionEntity } from './common/deletion.entity';

@Entity('warehouses')
export class WarehouseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ unique: true })
  code: string;

  @Column(() => DeletionEntity, { prefix: false })
  deletion: DeletionEntity;

  @Column(() => TimestampEntity, { prefix: false })
  timestamp: TimestampEntity;
}
