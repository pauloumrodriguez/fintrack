import { Category } from '../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../domain/repositories/category.repository.js';

export class ListCategoriesUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  execute(organizationId: string): Promise<Category[]> {
    return this.categories.findAllByOrganizationId(organizationId);
  }
}
