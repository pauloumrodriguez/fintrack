import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TenantDb } from '../../database/tenant-db.js';
import { AccountOrmEntity } from '../accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { CreateTransferDto } from './create-transfer.dto.js';
import { TransferOrmEntity } from './transfer.orm-entity.js';

@Injectable()
export class TransferService {
  constructor(private readonly tenantDb: TenantDb) {}

  async create(input: CreateTransferDto & { organizationId: string }): Promise<TransferOrmEntity> {
    if (input.fromAccountId === input.toAccountId) {
      throw new BadRequestException('Transfer accounts must be different');
    }
    return this.tenantDb.run(input.organizationId, async (manager) => {
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
        if (!account) throw new NotFoundException('Transfer account not found');
        accounts.push(account);
      }
      const from = accounts.find(
        (account) => account.id === input.fromAccountId,
      )!;
      const to = accounts.find((account) => account.id === input.toAccountId)!;
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
      });
      await manager.save(transfer);
      return transfer;
    });
  }

  list(organizationId: string): Promise<TransferOrmEntity[]> {
    return this.tenantDb.run(organizationId, (manager) => manager.getRepository(TransferOrmEntity).find({
      where: { organizationId }, order: { createdAt: 'DESC', id: 'DESC' },
    }));
  }
}
