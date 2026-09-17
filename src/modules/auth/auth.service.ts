import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { randomUUID } from 'node:crypto';
import { TenantDb } from '../../database/tenant-db.js';
import { OrganizationOrmEntity } from '../organizations/infrastructure/database/typeorm/organization.orm-entity.js';
import { PasswordHasher } from '../users/application/security/password-hasher.js';
import { User, UserRole } from '../users/domain/entities/user.entity.js';
import { UserRepository } from '../users/domain/repositories/user.repository.js';
import { UserOrmEntity } from '../users/infrastructure/database/typeorm/user.orm-entity.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
import type { AuthUser } from './auth-user.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantDb: TenantDb,
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const now = new Date();
    const organization = {
      id: randomUUID(),
      name: input.organizationName.trim(),
      createdAt: now,
    };
    const user = new User({
      id: randomUUID(),
      organizationId: organization.id,
      name: input.name,
      email,
      passwordHash: await this.hasher.hash(input.password),
      role: UserRole.ADMIN,
      createdAt: now,
    });
    try {
      await this.tenantDb.run(organization.id, async (manager) => {
        await manager.insert(OrganizationOrmEntity, organization);
        await manager.insert(UserOrmEntity, user);
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        const constraint = 'constraint' in error ? error.constraint : undefined;
        throw new ConflictException(
          constraint === 'UQ_organizations_normalized_name'
            ? 'Organization name already registered'
            : 'Email already registered',
        );
      }
      throw error;
    }
    return {
      organization,
      user: this.safeUser(user),
      accessToken: await this.sign(user),
    };
  }

  async login(input: LoginDto) {
    const user = await this.users.findByEmail(
      input.email,
      input.organizationId,
    );
    if (!user || !(await verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: await this.sign(user), user: this.safeUser(user) };
  }

  async provisionOrganization(actor: AuthUser, name: string) {
    const current = await this.users.findById(actor.id, actor.organizationId);
    if (!current || current.role !== UserRole.ADMIN)
      throw new ForbiddenException();
    const now = new Date();
    const organization = {
      id: randomUUID(),
      name: name.trim(),
      createdAt: now,
    };
    const admin = new User({
      id: randomUUID(),
      organizationId: organization.id,
      name: current.name,
      email: current.email,
      passwordHash: current.passwordHash,
      role: UserRole.ADMIN,
      createdAt: now,
    });
    try {
      await this.tenantDb.run(organization.id, async (manager) => {
        await manager.insert(OrganizationOrmEntity, organization);
        await manager.insert(UserOrmEntity, admin);
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'constraint' in error &&
        error.constraint === 'UQ_organizations_normalized_name'
      ) {
        throw new ConflictException('Organization name already registered');
      }
      throw error;
    }
    return {
      ...organization,
      admin: this.safeUser(admin),
      accessToken: await this.sign(admin),
    };
  }

  private sign(user: User): Promise<string> {
    return this.jwt.signAsync({
      sub: user.id,
      organizationId: user.organizationId,
    });
  }

  private safeUser(user: User) {
    return {
      id: user.id,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
