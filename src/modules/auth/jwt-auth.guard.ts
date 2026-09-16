import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../users/domain/repositories/user.repository.js';
import { PUBLIC_KEY, ROLES_KEY, TENANT_PARAM_KEY } from './auth.decorators.js';
import type { AuthRequest } from './auth-user.js';
import type { UserRole } from '../users/domain/entities/user.entity.js';

interface TokenClaims {
  sub: string;
  organizationId: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, target))
      return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer '))
      throw new UnauthorizedException();
    const token = authorization.slice(7);
    let claims: TokenClaims;
    try {
      claims = await this.jwt.verifyAsync<TokenClaims>(token);
    } catch {
      throw new UnauthorizedException();
    }
    if (
      typeof claims.sub !== 'string' ||
      typeof claims.organizationId !== 'string'
    ) {
      throw new UnauthorizedException();
    }
    const user = await this.users.findById(claims.sub);
    if (!user || user.organizationId !== claims.organizationId)
      throw new UnauthorizedException();
    request.user = {
      id: user.id,
      organizationId: user.organizationId,
      role: user.role,
    };
    const roles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      target,
    );
    if (roles && !roles.includes(user.role)) throw new ForbiddenException();
    const params = request.params as Record<string, string>;
    const body = request.body as { organizationId?: unknown } | undefined;
    if (params.organizationId && params.organizationId !== user.organizationId)
      throw new ForbiddenException();
    if (body?.organizationId && body.organizationId !== user.organizationId)
      throw new ForbiddenException();
    const tenantParam = this.reflector.getAllAndOverride<string>(TENANT_PARAM_KEY, target);
    if (tenantParam && params[tenantParam] !== user.organizationId) {
      throw new ForbiddenException();
    }
    return true;
  }
}
