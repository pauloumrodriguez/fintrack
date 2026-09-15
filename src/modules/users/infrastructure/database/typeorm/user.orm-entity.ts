import { Column, Entity, PrimaryColumn } from 'typeorm';
import { UserRole } from '../../../domain/entities/user.entity.js';

@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 30 })
  role: UserRole;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
