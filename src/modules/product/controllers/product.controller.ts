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
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dtos/requests/create-product.dto';
import { UpdateProductDto } from '../dtos/requests/update-product.dto';

import { ProductResponseDto } from '../dtos/responses/product-response.dto';
import { ApiResponse } from '../../../common/api-response';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(
    @Body() dto: CreateProductDto
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.create(dto);
    return new ApiResponse(
      'Product created successfully',
      new ProductResponseDto(product),
      201
    );
  }

  @Get()
  async findAll(): Promise<ApiResponse<ProductResponseDto[]>> {
    const products = await this.productService.findAll();
    return new ApiResponse(
      'Products fetched successfully',
      products.map((p) => new ProductResponseDto(p)),
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
      data: ProductResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const result = await this.productService.paginatedFind({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      includeDeleted: includeDeleted === 'true',
      deletedOnly: deletedOnly === 'true',
    });
    return new ApiResponse(
      'Products fetched successfully',
      {
        ...result,
        data: result.data.map((p) => new ProductResponseDto(p)),
      },
      200
    );
  }

  @Get(':uuid')
  async findOne(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.findOne(uuid);
    return new ApiResponse(
      'Product fetched successfully',
      new ProductResponseDto(product),
      200
    );
  }

  @Put(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateProductDto
  ): Promise<ApiResponse<ProductResponseDto>> {
    const product = await this.productService.update(uuid, dto);
    return new ApiResponse(
      'Product updated successfully',
      new ProductResponseDto(product),
      200
    );
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('uuid') uuid: string): Promise<ApiResponse<null>> {
    await this.productService.remove(uuid);
    return new ApiResponse('Product deleted successfully', null, 200);
  }
  @Get('stats/total')
  async getTotalAndGrowth(): Promise<
    ApiResponse<{
      active: { total: number; growth: number };
      deleted: { total: number; growth: number };
    }>
  > {
    const [active, deleted] = await Promise.all([
      this.productService.getTotalAndGrowth(false),
      this.productService.getTotalAndGrowth(true),
    ]);
    return new ApiResponse(
      'Product stats (active and deleted) and growth fetched successfully',
      { active, deleted },
      200
    );
  }
}
