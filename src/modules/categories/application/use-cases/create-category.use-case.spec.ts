import { Organization } from '../../../organizations/domain/entities/organization.entity.js';
import { InMemoryOrganizationRepository } from '../../../organizations/infrastructure/repositories/in-memory-organization.repository.js';
import { CategoryType } from '../../domain/entities/category.entity.js';
import { InMemoryCategoryRepository } from '../../infrastructure/repositories/in-memory-category.repository.js';
import { CategoryAlreadyExistsError } from '../errors/category-already-exists.error.js';
import { CategoryOrganizationNotFoundError } from '../errors/category-organization-not-found.error.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';

describe('CreateCategoryUseCase', () => {
  it('exige uma organização existente', async () => {
    const useCase = new CreateCategoryUseCase(
      new InMemoryCategoryRepository(),
      new InMemoryOrganizationRepository(),
    );
    await expect(
      useCase.execute({
        organizationId: 'org-1',
        name: 'Alimentação',
        type: CategoryType.EXPENSE,
      }),
    ).rejects.toBeInstanceOf(CategoryOrganizationNotFoundError);
  });

  it('rejeita o mesmo nome e tipo na mesma organização', async () => {
    const organizations = new InMemoryOrganizationRepository();
    await organizations.save(new Organization('org-1', 'Padaria', new Date()));
    const useCase = new CreateCategoryUseCase(
      new InMemoryCategoryRepository(),
      organizations,
    );
    await useCase.execute({
      organizationId: 'org-1',
      name: 'Alimentação',
      type: CategoryType.EXPENSE,
    });
    await expect(
      useCase.execute({
        organizationId: 'org-1',
        name: ' ALIMENTAÇÃO ',
        type: CategoryType.EXPENSE,
      }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError);
  });
});
