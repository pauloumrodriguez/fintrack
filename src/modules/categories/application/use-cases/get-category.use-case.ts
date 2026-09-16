import { Category } from '../../domain/entities/category.entity.js';
import { CategoryRepository } from '../../domain/repositories/category.repository.js';
import { CategoryNotFoundError } from '../errors/category-not-found.error.js';

export class GetCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(organizationId: string, id: string): Promise<Category> {
    const category = await this.categories.findById(organizationId, id);
    if (!category) {
      throw new CategoryNotFoundError();
    }
    return category;
  }
}
