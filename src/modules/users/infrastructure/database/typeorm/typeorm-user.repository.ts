import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { UserOrmEntity } from './user.orm-entity.js';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    await this.repository.save({
      id: user.id,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const record = await this.repository
      .createQueryBuilder('user')
      .where('LOWER(TRIM("user"."email")) = :normalizedEmail', {
        normalizedEmail,
      })
      .getOne();

    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.repository.findOneBy({ id });
    return record ? this.toDomain(record) : null;
  }

  async findAllByOrganizationId(organizationId: string): Promise<User[]> {
    const records = await this.repository.find({
      where: { organizationId },
      order: { createdAt: 'ASC' },
    });

    return records.map((record) => this.toDomain(record));
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
