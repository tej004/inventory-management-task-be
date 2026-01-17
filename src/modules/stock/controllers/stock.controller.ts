import { StockStatusPieDto } from '../dtos/responses/stock-status-pie.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { CreateStockDto } from '../dtos/requests/create-stock.dto';
import { UpdateStockDto } from '../dtos/requests/update-stock.dto';
import { StockResponseDto } from '../dtos/responses/stock-response.dto';
import { ApiResponse } from '../../../common/api-response';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async create(
    @Body() dto: CreateStockDto
  ): Promise<ApiResponse<StockResponseDto>> {
    const stock = await this.stockService.create(dto);
    return new ApiResponse(
      'Stock created successfully',
      new StockResponseDto(stock),
      201
    );
  }

  @Get()
  async findAll(): Promise<ApiResponse<StockResponseDto[]>> {
    const stocks = await this.stockService.findAll();
    return new ApiResponse(
      'Stocks fetched successfully',
      stocks.map((s) => new StockResponseDto(s)),
      200
    );
  }

  @Get('paginated')
  async paginatedFind(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('deletedOnly') deletedOnly?: string,
    @Query('category') category?: string,
    @Query('status') status?: 'inStock' | 'lowStock',
    @Query('warehouse') warehouse?: string
  ): Promise<
    ApiResponse<{
      data: StockResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const result = await this.stockService.paginatedFind({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      includeDeleted: includeDeleted === 'true',
      deletedOnly: deletedOnly === 'true',
      category,
      status,
      warehouse,
    });
    return new ApiResponse(
      'Stocks fetched successfully',
      {
        ...result,
        data: result.data.map((s) => new StockResponseDto(s)),
      },
      200
    );
  }

  @Get(':uuid')
  async findOne(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<StockResponseDto>> {
    const stock = await this.stockService.findOne(uuid);
    return new ApiResponse(
      'Stock fetched successfully',
      new StockResponseDto(stock),
      200
    );
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateStockDto
  ): Promise<ApiResponse<StockResponseDto>> {
    const stock = await this.stockService.update(uuid, dto);
    return new ApiResponse(
      'Stock updated successfully',
      new StockResponseDto(stock),
      200
    );
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string): Promise<ApiResponse<null>> {
    await this.stockService.remove(uuid);
    return new ApiResponse('Stock deleted successfully', null, 200);
  }

  @Get('stats/refill')
  async getRefillStats(): Promise<
    ApiResponse<{
      uniqueProducts: number;
      needRefill: Array<{ stock: StockResponseDto; reorderPoint: number }>;
    }>
  > {
    const { uniqueProducts, needRefill, totalToRefill } =
      await this.stockService.getRefillStats();
    return new ApiResponse(
      'Refill stats fetched successfully',
      {
        uniqueProducts,
        needRefill: needRefill.map(({ stock, reorderPoint }) => ({
          stock: new StockResponseDto(stock),
          reorderPoint,
        })),
        totalToRefill,
      },
      200
    );
  }

  @Get('stats/stock-status-pie')
  async getStockStatusPie(
    @Query('warehouse') warehouse?: string
  ): Promise<ApiResponse<StockStatusPieDto[]>> {
    const data = await this.stockService.getStockStatusPieData(warehouse);
    return new ApiResponse(
      'Stock status pie data fetched successfully',
      data,
      200
    );
  }

  @Get('stats/products-by-quantity-order')
  async getProductsByQuantityOrder(
    @Query('limit') limit?: string,
    @Query('warehouse') warehouse?: string,
    @Query('order') order?: 'ASC' | 'DESC'
  ): Promise<
    ApiResponse<
      Array<{ productId: string; productName: string; totalQuantity: number }>
    >
  > {
    const products = await this.stockService.getProductsByQuantityOrder({
      limit: limit ? parseInt(limit) : 5,
      warehouse,
      order: order === 'ASC' ? 'ASC' : 'DESC',
    });
    return new ApiResponse(
      `Products by stock quantity (${order === 'ASC' ? 'lowest' : 'top'}) fetched successfully`,
      products,
      200
    );
  }
}
