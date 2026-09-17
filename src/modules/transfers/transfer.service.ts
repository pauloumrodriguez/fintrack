import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import { QueryFailedError } from 'typeorm';
import { TenantDb } from '../../database/tenant-db.js';
import { AccountOrmEntity } from '../accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { CreateTransferDto } from './create-transfer.dto.js';
import { TransferOrmEntity } from './transfer.orm-entity.js';

@Injectable()
export class TransferService {
  constructor(private readonly tenantDb: TenantDb) {}

  async create(
    input: CreateTransferDto & {
      organizationId: string;
      idempotencyKey: string;
    },
  ): Promise<TransferOrmEntity> {
    if (input.fromAccountId === input.toAccountId) {
      throw new BadRequestException('Transfer accounts must be different');
    }
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amountInCents: input.amountInCents,
        }),
      )
      .digest('hex');
    const findExisting = () =>
      this.tenantDb.run(input.organizationId, (manager) =>
        manager.getRepository(TransferOrmEntity).findOneBy({
          organizationId: input.organizationId,
          idempotencyKey: input.idempotencyKey,
        }),
      );
    try {
      return await this.tenantDb.run(input.organizationId, async (manager) => {
        const transfers = manager.getRepository(TransferOrmEntity);
        const existing = await transfers.findOneBy({
          organizationId: input.organizationId,
          idempotencyKey: input.idempotencyKey,
        });
        if (existing) return this.replay(existing, requestHash);
        // Lock in a stable order so opposite transfers cannot deadlock.
        const ids = [input.fromAccountId, input.toAccountId].sort();
        const accounts = [];
        for (const id of ids) {
          const account = await manager
            .getRepository(AccountOrmEntity)
            .createQueryBuilder('account')
            .where('account.id = :id', { id })
            .andWhere('account.organizationId = :organizationId', {
              organizationId: input.organizationId,
            })
            .setLock('pessimistic_write')
            .getOne();
          if (!account)
            throw new NotFoundException('Transfer account not found');
          accounts.push(account);
        }
        const from = accounts.find(
          (account) => account.id === input.fromAccountId,
        )!;
        const to = accounts.find(
          (account) => account.id === input.toAccountId,
        )!;
        // A concurrent request with the same key may have committed while we waited for the locks.
        const committed = await transfers.findOneBy({
          organizationId: input.organizationId,
          idempotencyKey: input.idempotencyKey,
        });
        if (committed) return this.replay(committed, requestHash);
        if (from.balanceInCents < input.amountInCents) {
          throw new ConflictException('Insufficient balance');
        }
        const nextToBalance = to.balanceInCents + input.amountInCents;
        if (!Number.isSafeInteger(nextToBalance)) {
          throw new ConflictException(
            'Account balance exceeds safe integer range',
          );
        }
        await manager.update(
          AccountOrmEntity,
          { id: from.id },
          { balanceInCents: from.balanceInCents - input.amountInCents },
        );
        await manager.update(
          AccountOrmEntity,
          { id: to.id },
          { balanceInCents: nextToBalance },
        );
        const transfer = manager.create(TransferOrmEntity, {
          id: randomUUID(),
          organizationId: input.organizationId,
          fromAccountId: from.id,
          toAccountId: to.id,
          amountInCents: input.amountInCents,
          createdAt: new Date(),
          idempotencyKey: input.idempotencyKey,
          requestHash,
        });
        await manager.save(transfer);
        return transfer;
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { constraint?: string }).constraint ===
          'UQ_transfers_org_idempotency_key'
      ) {
        const existing = await findExisting();
        if (existing) return this.replay(existing, requestHash);
      }
      throw error;
    }
  }

  list(organizationId: string): Promise<TransferOrmEntity[]> {
    return this.tenantDb.run(organizationId, (manager) =>
      manager.getRepository(TransferOrmEntity).find({
        where: { organizationId },
        order: { createdAt: 'DESC', id: 'DESC' },
      }),
    );
  }

  private replay(
    transfer: TransferOrmEntity,
    requestHash: string,
  ): TransferOrmEntity {
    if (transfer.requestHash !== requestHash) {
      throw new ConflictException(
        'Idempotency-Key was used with different transfer data',
      );
    }
    return transfer;
  }
}
