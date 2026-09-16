import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TenantDb } from '../../../../../database/tenant-db.js';
import { UserAlreadyExistsError } from '../../../application/errors/user-already-exists.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { UserOrmEntity } from './user.orm-entity.js';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(private readonly tenantDb: TenantDb) {}

  async save(user: User): Promise<void> {
    try {
      await this.tenantDb.run(user.organizationId, async (manager) => {
        await manager.getRepository(UserOrmEntity).save({
          id: user.id, organizationId: user.organizationId, name: user.name,
          email: user.email, passwordHash: user.passwordHash,
          role: user.role, createdAt: user.createdAt,
        });
      });
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { constraint?: string }).constraint === 'UQ_users_normalized_email') {
        throw new UserAlreadyExistsError(user.email);
      }
      throw error;
    }
  }

  findByEmail(email: string, organizationId?: string): Promise<User | null> {
    if (!organizationId) throw new Error('Organization scope is required');
    const normalizedEmail = email.trim().toLowerCase();
    return this.tenantDb.run(organizationId, async (manager) => {
      const record = await manager.getRepository(UserOrmEntity)
        .createQueryBuilder('user')
        .where('LOWER(TRIM("user"."email")) = :normalizedEmail', { normalizedEmail })
        .getOne();
      return record ? this.toDomain(record) : null;
    });
  }

  findById(id: string, organizationId?: string): Promise<User | null> {
    if (!organizationId) throw new Error('Organization scope is required');
    return this.tenantDb.run(organizationId, async (manager) => {
      const record = await manager.getRepository(UserOrmEntity).findOneBy({ id, organizationId });
      return record ? this.toDomain(record) : null;
    });
  }

  async findAllByOrganizationId(organizationId: string): Promise<User[]> {
    return this.tenantDb.run(organizationId, async (manager) => {
      const records = await manager.getRepository(UserOrmEntity).find({
        where: { organizationId }, order: { createdAt: 'ASC' },
      });
      return records.map((record) => this.toDomain(record));
    });
  }

  private toDomain(record: UserOrmEntity): User {
    return new User({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      role: record.role,
      createdAt: record.createdAt,
    });
  }
}
