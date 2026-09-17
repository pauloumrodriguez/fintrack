import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transfers' })
export class TransferOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'organization_id', type: 'uuid' }) organizationId: string;
  @Column({ name: 'from_account_id', type: 'uuid' }) fromAccountId: string;
  @Column({ name: 'to_account_id', type: 'uuid' }) toAccountId: string;
  @Column({
    name: 'amount_in_cents',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amountInCents: number;
  @Column({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  idempotencyKey: string | null;
  @Column({ name: 'request_hash', type: 'char', length: 64, nullable: true })
  requestHash: string | null;
}
