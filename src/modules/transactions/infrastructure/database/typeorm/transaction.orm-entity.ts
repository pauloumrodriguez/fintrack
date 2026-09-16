import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TransactionType } from '../../../domain/entities/transaction.entity.js';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({
    name: 'amount_in_cents',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amountInCents: number;

  @Column({ type: 'varchar', length: 10 })
  type: TransactionType;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 128, nullable: true })
  idempotencyKey: string | null;

  @Column({ name: 'request_hash', type: 'char', length: 64, nullable: true })
  requestHash: string | null;
}
