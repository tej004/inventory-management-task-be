import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '../dtos/requests/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/requests/update-transaction.dto';
import { TransactionResponseDto } from '../dtos/responses/transaction-response.dto';
import { ApiResponse } from '../../../common/api-response';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Body() dto: CreateTransactionDto
  ): Promise<ApiResponse<TransactionResponseDto>> {
    const transaction = await this.transactionService.create(dto);
    return new ApiResponse(
      'Transaction created successfully',
      new TransactionResponseDto(transaction),
      201
    );
  }

  @Get()
  async findAll(): Promise<ApiResponse<TransactionResponseDto[]>> {
    const transactions = await this.transactionService.findAll();
    return new ApiResponse(
      'Transactions fetched successfully',
      transactions.map((t) => new TransactionResponseDto(t)),
      200
    );
  }

  @Get(':uuid')
  async findOne(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<TransactionResponseDto>> {
    const transaction = await this.transactionService.findOne(uuid);
    return new ApiResponse(
      'Transaction fetched successfully',
      new TransactionResponseDto(transaction),
      200
    );
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateTransactionDto
  ): Promise<ApiResponse<TransactionResponseDto>> {
    const transaction = await this.transactionService.update(uuid, dto);
    return new ApiResponse(
      'Transaction updated successfully',
      new TransactionResponseDto(transaction),
      200
    );
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string): Promise<ApiResponse<null>> {
    await this.transactionService.remove(uuid);
    return new ApiResponse('Transaction deleted successfully', null, 200);
  }

  @Get('paginated')
  async paginatedFind(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string
  ): Promise<
    ApiResponse<{
      data: TransactionResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const result = await this.transactionService.paginatedFind({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      productId,
      warehouseId,
    });
    return new ApiResponse(
      'Transactions fetched successfully',
      {
        ...result,
        data: result.data.map((t) => new TransactionResponseDto(t)),
      },
      200
    );
  }
}
