import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'accounts' })
export class AccountOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    name: 'balance_in_cents',
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  balanceInCents: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
