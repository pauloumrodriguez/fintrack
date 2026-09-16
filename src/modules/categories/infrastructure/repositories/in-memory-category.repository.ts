import {
  Category,
  CategoryType,
} from '../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../domain/repositories/category.repository.js';

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly categories: Category[] = [];

  async save(category: Category): Promise<void> {
    this.categories.push(category);
  }

  async findById(organizationId: string, id: string): Promise<Category | null> {
    return (
      this.categories.find(
        (category) =>
          category.organizationId === organizationId && category.id === id,
      ) ?? null
    );
  }

  async findByName(
    organizationId: string,
    type: CategoryType,
    name: string,
  ): Promise<Category | null> {
    const normalized = name.trim().toLowerCase();
    return (
      this.categories.find(
        (category) =>
          category.organizationId === organizationId &&
          category.type === type &&
          category.name.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async findAllByOrganizationId(organizationId: string): Promise<Category[]> {
    return this.categories.filter(
      (category) => category.organizationId === organizationId,
    );
  }
}
