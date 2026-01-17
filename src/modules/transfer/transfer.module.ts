import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferEntity } from 'src/database/entities/transfer.entity';
import { StockEntity } from 'src/database/entities/stock.entity';
import { TransferService } from './services/transfer.service';
import { TransferController } from './controllers/transfer.controller';
import { WarehouseEntity } from 'src/database/entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransferEntity, StockEntity, WarehouseEntity]),
  ],
  providers: [TransferService],
  controllers: [TransferController],
  exports: [TransferService],
})
export class TransferModule {}
