import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { CreateTransferDto } from './create-transfer.dto.js';
import { TransferService } from './transfer.service.js';
import { Roles } from '../auth/auth.decorators.js';
import { UserRole } from '../users/domain/entities/user.entity.js';
import type { AuthRequest } from '../auth/auth-user.js';
import { TransferOrmEntity } from './transfer.orm-entity.js';

@Controller()
export class TransferController {
  constructor(private readonly transfers: TransferService) {}

  @Post('transfers')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  async create(
    @Body() body: CreateTransferDto,
    @Req() request: AuthRequest,
    @Headers('idempotency-key') key?: string,
  ) {
    if (!key || !/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
      throw new BadRequestException(
        'Idempotency-Key must be 8-128 safe characters',
      );
    }
    const transfer = await this.transfers.create({
      organizationId: request.user!.organizationId,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amountInCents: body.amountInCents,
      idempotencyKey: key,
    });
    return this.toResponse(transfer);
  }

  @Get('organizations/:organizationId/transfers')
  async list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    const transfers = await this.transfers.list(organizationId);
    return transfers.map((transfer) => this.toResponse(transfer));
  }

  private toResponse(transfer: TransferOrmEntity) {
    return {
      id: transfer.id,
      organizationId: transfer.organizationId,
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      amountInCents: transfer.amountInCents,
      createdAt: transfer.createdAt,
    };
  }
}
