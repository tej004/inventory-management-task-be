import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  fromWarehouseId: string;

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
