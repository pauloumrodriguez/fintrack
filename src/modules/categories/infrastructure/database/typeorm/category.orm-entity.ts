import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CategoryType } from '../../../domain/entities/category.entity.js';

@Entity({ name: 'categories' })
export class CategoryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  type: CategoryType;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
