import {
  Body,
  Controller,
  Get,
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

@Controller()
export class TransferController {
  constructor(private readonly transfers: TransferService) {}

  @Post('transfers')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  create(@Body() body: CreateTransferDto, @Req() request: AuthRequest) {
    return this.transfers.create({ ...body, organizationId: request.user!.organizationId });
  }

  @Get('organizations/:organizationId/transfers')
  list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    return this.transfers.list(organizationId);
  }
}
