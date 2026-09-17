import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateOrganizationDto } from '../organizations/presentation/http/dto/create-organization.dto.js';
import { UserRole } from '../users/domain/entities/user.entity.js';
import { Roles } from './auth.decorators.js';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-user.js';

@Controller('organizations')
export class ProvisionOrganizationController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateOrganizationDto, @Req() request: AuthRequest) {
    return this.auth.provisionOrganization(request.user!, body.name);
  }
}
