import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { TenantDb } from '../../../../../database/tenant-db.js';
import { Account } from '../../../../accounts/domain/entities/account.entity.js';
import { AccountOrmEntity } from '../../../../accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { TransactionAccountNotFoundError } from '../../../application/errors/transaction-account-not-found.error.js';
import { TransactionBalanceOverflowError } from '../../../application/errors/transaction-balance-overflow.error.js';
import { TransactionIdempotencyConflictError } from '../../../application/errors/transaction-idempotency-conflict.error.js';
import { Transaction } from '../../../domain/entities/transaction.entity.js';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository.js';
import { TransactionOrmEntity } from './transaction.orm-entity.js';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    private readonly tenantDb: TenantDb,
  ) {}

  async createAndApplyBalance(transaction: Transaction): Promise<Transaction> {
    try {
      return await this.tenantDb.run(transaction.organizationId, async (manager) => {
      if (transaction.idempotencyKey) {
        const existing = await manager.getRepository(TransactionOrmEntity).findOneBy({
          organizationId: transaction.organizationId,
          idempotencyKey: transaction.idempotencyKey,
        });
        if (existing) return this.replay(existing, transaction);
      }
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
        idempotencyKey: transaction.idempotencyKey ?? null,
        requestHash: transaction.requestHash ?? null,
      });
      return transaction;
      });
    } catch (error) {
      if (transaction.idempotencyKey && error instanceof QueryFailedError &&
        (error.driverError as { constraint?: string }).constraint === 'UQ_transactions_org_idempotency_key') {
        const existing = await this.tenantDb.run(transaction.organizationId, (manager) =>
          manager.getRepository(TransactionOrmEntity).findOneBy({
            organizationId: transaction.organizationId,
            idempotencyKey: transaction.idempotencyKey!,
          }));
        if (existing) return this.replay(existing, transaction);
      }
      throw error;
    }
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<Transaction | null> {
    return this.tenantDb.run(organizationId, async (manager) => {
      const record = await manager.getRepository(TransactionOrmEntity).findOneBy({ organizationId, id });
      return record ? this.toDomain(record) : null;
    });
  }

  async findAllByOrganizationId(
    organizationId: string,
  ): Promise<Transaction[]> {
    return this.tenantDb.run(organizationId, async (manager) => {
      const records = await manager.getRepository(TransactionOrmEntity).find({
        where: { organizationId }, order: { occurredAt: 'DESC', id: 'DESC' },
      });
      return records.map((record) => this.toDomain(record));
    });
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
      idempotencyKey: record.idempotencyKey ?? undefined,
      requestHash: record.requestHash ?? undefined,
    });
  }

  private replay(record: TransactionOrmEntity, request: Transaction): Transaction {
    if (record.requestHash !== request.requestHash) {
      throw new TransactionIdempotencyConflictError();
    }
    return this.toDomain(record);
  }
}
