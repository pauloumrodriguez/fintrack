import type { Request } from 'express';
import { UserRole } from '../users/domain/entities/user.entity.js';

export interface AuthUser {
  id: string;
  organizationId: string;
  role: UserRole;
}

export type AuthRequest = Request & { user?: AuthUser };
