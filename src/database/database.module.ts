import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from './data-source/data-source';
import { ProductEntity } from './entities/product.entity';
import { StockEntity } from './entities/stock.entity';
import { WarehouseEntity } from './entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSource.options),
    TypeOrmModule.forFeature([ProductEntity, StockEntity, WarehouseEntity]),
  ],
})
export class DatabaseModule {}
