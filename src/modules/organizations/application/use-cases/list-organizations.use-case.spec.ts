import { Organization } from '../../domain/entities/organization.entity.js';
import { InMemoryOrganizationRepository } from '../../infrastructure/repositories/in-memory-organization.repository.js';
import { ListOrganizationsUseCase } from './list-organizations.use-case.js';

describe('ListOrganizationsUseCase', () => {
  it('lista as organizações salvas', async () => {
    const repository = new InMemoryOrganizationRepository();
    const organization = new Organization(
      'org-001',
      'Padaria do Paulo',
      new Date(),
    );
    await repository.save(organization);
    const useCase = new ListOrganizationsUseCase(repository);

    const organizations = await useCase.execute();

    expect(organizations).toEqual([organization]);
  });
});
