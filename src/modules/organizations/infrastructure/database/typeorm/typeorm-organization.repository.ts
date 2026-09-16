import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TenantDb } from '../../../../../database/tenant-db.js';
import { OrganizationAlreadyExistsError } from '../../../application/errors/organization-already-exists.error.js';
import { Organization } from '../../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository.js';
import { OrganizationOrmEntity } from './organization.orm-entity.js';

@Injectable()
export class TypeOrmOrganizationRepository
  implements OrganizationRepository
{
  constructor(
    @InjectRepository(OrganizationOrmEntity)
    private readonly repository: Repository<OrganizationOrmEntity>,
    private readonly tenantDb: TenantDb,
  ) {}

  async save(organization: Organization): Promise<void> {
    try {
      await this.tenantDb.run(organization.id, async (manager) => {
        await manager.getRepository(OrganizationOrmEntity).save({
          id: organization.id, name: organization.name, createdAt: organization.createdAt,
        });
      });
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { constraint?: string }).constraint === 'UQ_organizations_normalized_name') {
        throw new OrganizationAlreadyExistsError(organization.name);
      }
      throw error;
    }
  }

  async findAll(): Promise<Organization[]> {
    const records = await this.repository.find({
      order: { createdAt: 'ASC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Organization | null> {
    return this.tenantDb.run(id, async (manager) => {
      const record = await manager.getRepository(OrganizationOrmEntity).findOneBy({ id });
      return record ? this.toDomain(record) : null;
    });
  }

  async findByName(name: string): Promise<Organization | null> {
    const normalizedName = name.trim().toLowerCase();
    const record = await this.repository
      .createQueryBuilder('organization')
      .where('LOWER(TRIM(organization.name)) = :normalizedName', {
        normalizedName,
      })
      .getOne();

    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: OrganizationOrmEntity): Organization {
    return new Organization(record.id, record.name, record.createdAt);
  }
}
