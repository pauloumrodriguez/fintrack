import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrganizationUseCase } from '../../application/use-cases/create-organization.use-case.js';
import { ListOrganizationsUseCase } from '../../application/use-cases/list-organizations.use-case.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
  ) {}

  @Get()
  list() {
    return this.listOrganizationsUseCase.execute();
  }

  @Post()
  create(@Body() body: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(body);
  }
}
