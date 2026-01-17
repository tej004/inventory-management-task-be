import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockEntity } from 'src/database/entities/stock.entity';
import { StockService } from './services/stock.service';
import { StockController } from './controllers/stock.controller';
import { TransferModule } from '../transfer/transfer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockEntity]),
    forwardRef(() => TransferModule),
  ],
  providers: [StockService],
  controllers: [StockController],
})
export class StockModule {}
