import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { ETransactionReason } from 'src/database/entities/enum/transaction.reason.enum';
import { ETransactionType } from 'src/database/entities/enum/transaction.type.enum';

export class CreateTransactionDto {
  @IsUUID()
  stockId: string;

  @IsEnum(ETransactionType)
  type: ETransactionType;

  @IsEnum(ETransactionReason)
  reason: ETransactionReason;

  @IsNumber()
  quantity: number;
}
