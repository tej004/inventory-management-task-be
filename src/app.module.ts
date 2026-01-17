import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductModule } from './modules/product/product.module';
import { StockModule } from './modules/stock/stock.module';
import { TransferModule } from './modules/transfer/transfer.module';

@Module({
  imports: [DatabaseModule, ConfigModule, WarehouseModule, ProductModule, StockModule, TransferModule],
})
export class AppModule {}
