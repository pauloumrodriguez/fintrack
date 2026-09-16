import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { CreateOrganizationUseCase } from '../../application/use-cases/create-organization.use-case.js';
import { GetOrganizationUseCase } from '../../application/use-cases/get-organization.use-case.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { OrganizationExceptionFilter } from './organization-exception.filter.js';
import { Roles, TenantParam } from '../../../auth/auth.decorators.js';
import type { AuthRequest } from '../../../auth/auth-user.js';
import { UserRole } from '../../../users/domain/entities/user.entity.js';

@Controller('organizations')
@UseFilters(OrganizationExceptionFilter)
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
  ) {}

  @Get()
  async list(@Req() request: AuthRequest) {
    const organization = await this.getOrganizationUseCase.execute(
      request.user!.organizationId,
    );
    return [organization];
  }

  @Get(':id')
  @TenantParam('id')
  getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.getOrganizationUseCase.execute(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(body);
  }
}
