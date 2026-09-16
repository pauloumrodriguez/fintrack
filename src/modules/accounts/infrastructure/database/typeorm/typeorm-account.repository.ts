import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { AccountAlreadyExistsError } from '../../../application/errors/account-already-exists.error.js';
import { Account } from '../../../domain/entities/account.entity.js';
import { AccountRepository } from '../../../domain/repositories/account.repository.js';
import { AccountOrmEntity } from './account.orm-entity.js';

@Injectable()
export class TypeOrmAccountRepository implements AccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly repository: Repository<AccountOrmEntity>,
  ) {}

  async save(account: Account): Promise<void> {
    try {
      await this.repository.save({
        id: account.id,
        organizationId: account.organizationId,
        name: account.name,
        balanceInCents: account.balanceInCents,
        createdAt: account.createdAt,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          constraint?: string;
        };
        if (
          driverError.code === '23505' &&
          driverError.constraint === 'UQ_accounts_organization_normalized_name'
        ) {
          throw new AccountAlreadyExistsError(account.name);
        }
      }
      throw error;
    }
  }

  async findById(organizationId: string, id: string): Promise<Account | null> {
    const record = await this.repository.findOneBy({ organizationId, id });
    return record ? this.toDomain(record) : null;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<Account | null> {
    const normalizedName = name.trim().toLowerCase();
    const record = await this.repository
      .createQueryBuilder('account')
      .where('account.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(TRIM(account.name)) = :normalizedName', {
        normalizedName,
      })
      .getOne();
    return record ? this.toDomain(record) : null;
  }

  async findAllByOrganizationId(organizationId: string): Promise<Account[]> {
    const records = await this.repository.find({
      where: { organizationId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: AccountOrmEntity): Account {
    return new Account({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      balanceInCents: record.balanceInCents,
      createdAt: record.createdAt,
    });
  }
}
