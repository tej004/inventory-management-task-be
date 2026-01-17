import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransferService } from '../services/transfer.service';
import { CreateTransferDto } from '../dtos/requests/create-transfer.dto';
import { TransferResponseDto } from '../dtos/responses/transfer-response.dto';
import { ApiResponse } from '../../../common/api-response';

@Controller('transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  async create(
    @Body() dto: CreateTransferDto
  ): Promise<ApiResponse<TransferResponseDto>> {
    const transfer = await this.transferService.create(dto);
    return new ApiResponse(
      'Transfer created successfully',
      new TransferResponseDto(transfer),
      201
    );
  }

  @Post(':uuid/receive')
  @HttpCode(HttpStatus.OK)
  async receive(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<TransferResponseDto>> {
    const transfer = await this.transferService.receive(uuid);
    return new ApiResponse(
      'Transfer received successfully',
      new TransferResponseDto(transfer),
      200
    );
  }

  @Post(':uuid/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<TransferResponseDto>> {
    const transfer = await this.transferService.approve(uuid);
    return new ApiResponse(
      'Transfer approved successfully',
      new TransferResponseDto(transfer),
      200
    );
  }

  @Post(':uuid/decline')
  @HttpCode(HttpStatus.OK)
  async decline(
    @Param('uuid') uuid: string
  ): Promise<ApiResponse<TransferResponseDto>> {
    const transfer = await this.transferService.decline(uuid);
    return new ApiResponse(
      'Transfer declined and stock returned',
      new TransferResponseDto(transfer),
      200
    );
  }
}
