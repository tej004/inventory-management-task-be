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
import { WarehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto } from '../dtos/requests/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dtos/requests/update-warehouse.dto';
import { WarehouseResponseDto } from '../dtos/responses/warehouse-response.dto';
import { ApiResponse } from '../../../common/api-response';

@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  async create(
    @Body() dto: CreateWarehouseDto
  ): Promise<ApiResponse<WarehouseResponseDto>> {
    const warehouse = await this.warehouseService.create(dto);
    return new ApiResponse(
      'Warehouse created successfully',
      new WarehouseResponseDto(warehouse),
      201
    );
  }

  @Get()
  async findAll(): Promise<ApiResponse<WarehouseResponseDto[]>> {
    const warehouses = await this.warehouseService.findAll();
    return new ApiResponse(
      'Warehouses fetched successfully',
      warehouses.map((w) => new WarehouseResponseDto(w)),
      200
    );
  }

  @Get('paginated')
  async paginatedFind(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('deletedOnly') deletedOnly?: string
  ): Promise<
    ApiResponse<{
      data: WarehouseResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const result = await this.warehouseService.paginatedFind({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      includeDeleted: includeDeleted === 'true',
      deletedOnly: deletedOnly === 'true',
    });
    return new ApiResponse(
      'Warehouses fetched successfully',
      {
        ...result,
        data: result.data.map((w) => new WarehouseResponseDto(w)),
      },
      200
    );
  }

  @Get(':uuid')
  async findOne(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<WarehouseResponseDto>> {
    const warehouse = await this.warehouseService.findOne(uuid);
    return new ApiResponse(
      'Warehouse fetched successfully',
      new WarehouseResponseDto(warehouse),
      200
    );
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateWarehouseDto
  ): Promise<ApiResponse<WarehouseResponseDto>> {
    const warehouse = await this.warehouseService.update(uuid, dto);
    return new ApiResponse(
      'Warehouse updated successfully',
      new WarehouseResponseDto(warehouse),
      200
    );
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string): Promise<ApiResponse<null>> {
    await this.warehouseService.remove(uuid);
    return new ApiResponse('Warehouse deleted successfully', null, 200);
  }

  @Get('stats/total')
  async getTotalWarehouses(): Promise<
    ApiResponse<{ total: number; growth: number }>
  > {
    const { total, growth } =
      await this.warehouseService.getTotalAndGrowth(false);
    return new ApiResponse(
      'Total non-deleted warehouses and growth',
      { total, growth },
      200
    );
  }

  @Get('stats/deleted')
  async getDeletedWarehouses(): Promise<
    ApiResponse<{ total: number; growth: number }>
  > {
    const { total, growth } =
      await this.warehouseService.getTotalAndGrowth(true);
    return new ApiResponse(
      'Total deleted warehouses and growth',
      { total, growth },
      200
    );
  }
}
