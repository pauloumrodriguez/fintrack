import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrganizationUseCase } from '../../application/use-cases/create-organization.use-case.js';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
  ) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.createOrganizationUseCase.execute(body);
  }
}
