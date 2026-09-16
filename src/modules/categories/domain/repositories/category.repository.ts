import { Category, CategoryType } from '../entities/category.entity.js';

export abstract class CategoryRepository {
  abstract save(category: Category): Promise<void>;
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<Category | null>;
  abstract findByName(
    organizationId: string,
    type: CategoryType,
    name: string,
  ): Promise<Category | null>;
  abstract findAllByOrganizationId(organizationId: string): Promise<Category[]>;
}
