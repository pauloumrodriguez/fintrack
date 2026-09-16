import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/domain/entities/user.entity.js';

export const PUBLIC_KEY = 'fintrack:public';
export const ROLES_KEY = 'fintrack:roles';
export const TENANT_PARAM_KEY = 'fintrack:tenantParam';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const TenantParam = (name: string) => SetMetadata(TENANT_PARAM_KEY, name);
