import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  quantity: number;
}
