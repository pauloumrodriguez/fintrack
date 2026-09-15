import { Organization } from '../../domain/entities/organization.entity.js';
import { InMemoryOrganizationRepository } from '../../infrastructure/repositories/in-memory-organization.repository.js';
import { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';
import { GetOrganizationUseCase } from './get-organization.use-case.js';

describe('GetOrganizationUseCase', () => {
  it('encontra uma organização pelo id', async () => {
    const repository = new InMemoryOrganizationRepository();
    const organization = new Organization(
      'org-001',
      'Padaria do Paulo',
      new Date(),
    );
    await repository.save(organization);
    const useCase = new GetOrganizationUseCase(repository);

    await expect(useCase.execute('org-001')).resolves.toBe(organization);
  });

  it('informa quando a organização não existe', async () => {
    const repository = new InMemoryOrganizationRepository();
    const useCase = new GetOrganizationUseCase(repository);

    await expect(useCase.execute('org-inexistente')).rejects.toBeInstanceOf(
      OrganizationNotFoundError,
    );
  });
});
