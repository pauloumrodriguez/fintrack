import { randomUUID } from 'node:crypto';
import { OrganizationRepository } from '../../../organizations/domain/repositories/organization.repository.js';
import { Category, CategoryType } from '../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../domain/repositories/category.repository.js';
import { CategoryAlreadyExistsError } from '../errors/category-already-exists.error.js';
import { CategoryOrganizationNotFoundError } from '../errors/category-organization-not-found.error.js';

interface CreateCategoryInput {
  organizationId: string;
  name: string;
  type: CategoryType;
}

export class CreateCategoryUseCase {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly organizations: OrganizationRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const organization = await this.organizations.findById(input.organizationId);
    if (!organization) {
      throw new CategoryOrganizationNotFoundError();
    }
    const existing = await this.categories.findByName(
      input.organizationId,
      input.type,
      input.name,
    );
    if (existing) {
      throw new CategoryAlreadyExistsError();
    }
    const category = new Category({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      type: input.type,
      createdAt: new Date(),
    });
    await this.categories.save(category);
    return category;
  }
}
