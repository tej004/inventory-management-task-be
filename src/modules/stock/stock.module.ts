import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockEntity } from 'src/database/entities/stock.entity';
import { StockService } from './services/stock.service';
import { StockController } from './controllers/stock.controller';
import { TransferModule } from '../transfer/transfer.module';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { StockTransactionEntity } from 'src/database/entities/stock_transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockEntity, StockTransactionEntity]),
    forwardRef(() => TransferModule),
  ],
  providers: [StockService, TransactionService],
  controllers: [StockController, TransactionController],
})
export class StockModule {}
