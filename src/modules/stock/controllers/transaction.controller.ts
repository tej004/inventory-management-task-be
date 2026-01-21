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
import { ETransactionReason } from 'src/database/entities/enum/transaction.reason.enum';

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

  @Get('stats/monthly-sales')
  async getMonthlySalesStats(
    @Query('warehouseId') warehouseId?: string
  ): Promise<
    ApiResponse<{ totalSalesThisMonth: number; growthPercent: number }>
  > {
    const stats =
      await this.transactionService.getMonthlySalesStats(warehouseId);
    return new ApiResponse(
      'Monthly sales stats fetched successfully',
      stats,
      200
    );
  }

  @Get('stats/daily-warehouse-sales')
  async getDailyWarehouseSalesChart(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ApiResponse<any[]>> {
    const chart = await this.transactionService.getDailyWarehouseSalesChart(
      startDate,
      endDate
    );
    return new ApiResponse(
      'Daily warehouse sales chart data fetched successfully',
      chart,
      200
    );
  }

  @Get('stats/total-transaction-value')
  async getTotalTransactionValue(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('reason') reason?: ETransactionReason
  ): Promise<ApiResponse<number>> {
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const value = await this.transactionService.getTotalTransactionValue({
      warehouseId,
      productId,
      startDate: parsedStart,
      endDate: parsedEnd,
      reason: reason,
    });

    return new ApiResponse(
      'Total transaction value fetched successfully',
      value,
      200
    );
  }

  @Get('stats/total-sales-value-all-time')
  async getTotalSalesValueAllTime(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string
  ): Promise<ApiResponse<number>> {
    const value = await this.transactionService.getTotalSalesValueAllTime({
      warehouseId,
      productId,
    });
    return new ApiResponse(
      'Total sales value (all time) fetched successfully',
      value,
      200
    );
  }
}
