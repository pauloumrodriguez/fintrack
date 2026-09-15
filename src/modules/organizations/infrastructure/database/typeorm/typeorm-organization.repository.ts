import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async save(organization: Organization): Promise<void> {
    await this.repository.save({
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
    });
  }

  async findAll(): Promise<Organization[]> {
    const records = await this.repository.find({
      order: { createdAt: 'ASC' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Organization | null> {
    const record = await this.repository.findOneBy({ id });

    return record ? this.toDomain(record) : null;
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
