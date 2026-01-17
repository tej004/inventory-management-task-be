import { Column, DeleteDateColumn } from 'typeorm';

export abstract class DeletionEntity {
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date | null;

  @Column({ name: 'isDeleted', type: 'boolean', default: false })
  isDeleted: boolean;
}
