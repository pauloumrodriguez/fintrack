import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Account } from '../../../../accounts/domain/entities/account.entity.js';
import { AccountOrmEntity } from '../../../../accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { TransactionAccountNotFoundError } from '../../../application/errors/transaction-account-not-found.error.js';
import { TransactionBalanceOverflowError } from '../../../application/errors/transaction-balance-overflow.error.js';
import { Transaction } from '../../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository.js';
import { TransactionOrmEntity } from './transaction.orm-entity.js';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async createAndApplyBalance(transaction: Transaction): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const account = await manager
        .getRepository(AccountOrmEntity)
        .createQueryBuilder('account')
        .where('account.id = :id', { id: transaction.accountId })
        .andWhere('account.organizationId = :organizationId', {
          organizationId: transaction.organizationId,
        })
        .setLock('pessimistic_write')
        .getOne();

      if (!account) {
        throw new TransactionAccountNotFoundError();
      }

      const nextBalance =
        account.balanceInCents + transaction.balanceDeltaInCents;
      if (!Number.isSafeInteger(nextBalance)) {
        throw new TransactionBalanceOverflowError();
      }
      const updatedAccount = new Account({
        id: account.id,
        organizationId: account.organizationId,
        name: account.name,
        balanceInCents: account.balanceInCents,
        createdAt: account.createdAt,
      }).withBalanceChange(transaction.balanceDeltaInCents);

      await manager.update(
        AccountOrmEntity,
        { id: account.id, organizationId: transaction.organizationId },
        { balanceInCents: updatedAccount.balanceInCents },
      );
      await manager.insert(TransactionOrmEntity, {
        id: transaction.id,
        organizationId: transaction.organizationId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amountInCents: transaction.amountInCents,
        type: transaction.type,
        description: transaction.description,
        occurredAt: transaction.occurredAt,
        createdAt: transaction.createdAt,
      });
    });
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<Transaction | null> {
    const record = await this.repository.findOneBy({ organizationId, id });
    return record ? this.toDomain(record) : null;
  }

  async findAllByOrganizationId(
    organizationId: string,
  ): Promise<Transaction[]> {
    const records = await this.repository.find({
      where: { organizationId },
      order: { occurredAt: 'DESC', id: 'DESC' },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: TransactionOrmEntity): Transaction {
    return new Transaction({
      id: record.id,
      organizationId: record.organizationId,
      accountId: record.accountId,
      categoryId: record.categoryId,
      amountInCents: record.amountInCents,
      type: record.type,
      description: record.description,
      occurredAt: record.occurredAt,
      createdAt: record.createdAt,
    });
  }
}
