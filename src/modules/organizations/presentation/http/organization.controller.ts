import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseFilters,
} from '@nestjs/common';
import { GetOrganizationUseCase } from '../../application/use-cases/get-organization.use-case.js';
import { OrganizationExceptionFilter } from './organization-exception.filter.js';
import { TenantParam } from '../../../auth/auth.decorators.js';
import type { AuthRequest } from '../../../auth/auth-user.js';

@Controller('organizations')
@UseFilters(OrganizationExceptionFilter)
export class OrganizationController {
  constructor(
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
}
