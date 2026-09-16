import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CategoryAlreadyExistsError } from '../../../application/errors/category-already-exists.error.js';
import {
  Category,
  CategoryType,
} from '../../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../../domain/repositories/category.repository.js';
import { CategoryOrmEntity } from './category.orm-entity.js';

@Injectable()
export class TypeOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repository: Repository<CategoryOrmEntity>,
  ) {}

  async save(category: Category): Promise<void> {
    try {
      await this.repository.save({
        id: category.id,
        organizationId: category.organizationId,
        name: category.name,
        type: category.type,
        createdAt: category.createdAt,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          constraint?: string;
        };
        if (
          driverError.code === '23505' &&
          driverError.constraint === 'UQ_categories_org_type_name'
        ) {
          throw new CategoryAlreadyExistsError();
        }
      }
      throw error;
    }
  }

  async findById(organizationId: string, id: string): Promise<Category | null> {
    const record = await this.repository.findOneBy({ organizationId, id });
    return record ? this.toDomain(record) : null;
  }

  async findByName(
    organizationId: string,
    type: CategoryType,
    name: string,
  ): Promise<Category | null> {
    const record = await this.repository
      .createQueryBuilder('category')
      .where('category.organizationId = :organizationId', { organizationId })
      .andWhere('category.type = :type', { type })
      .andWhere('LOWER(TRIM(category.name)) = :name', {
        name: name.trim().toLowerCase(),
      })
      .getOne();
    return record ? this.toDomain(record) : null;
  }

  async findAllByOrganizationId(organizationId: string): Promise<Category[]> {
    const records = await this.repository.find({
      where: { organizationId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: CategoryOrmEntity): Category {
    return new Category({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      type: record.type,
      createdAt: record.createdAt,
    });
  }
}
