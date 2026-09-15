import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateOrganizationUseCase } from '../../application/use-cases/create-organization.use-case.js';
import { GetOrganizationUseCase } from '../../application/use-cases/get-organization.use-case.js';
import { ListOrganizationsUseCase } from '../../application/use-cases/list-organizations.use-case.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { OrganizationExceptionFilter } from './organization-exception.filter.js';

@Controller('organizations')
@UseFilters(OrganizationExceptionFilter)
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
  ) {}

  @Get()
  list() {
    return this.listOrganizationsUseCase.execute();
  }

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.getOrganizationUseCase.execute(id);
  }

  @Post()
  create(@Body() body: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(body);
  }
}
