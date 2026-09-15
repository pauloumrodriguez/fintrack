import { InMemoryOrganizationRepository } from '../../infrastructure/repositories/in-memory-organization.repository.js';
import { CreateOrganizationUseCase } from './create-organization.use-case.js';

describe('CreateOrganizationUseCase', () => {
  it('cria e salva uma organização com nome válido', async () => {
    const repository = new InMemoryOrganizationRepository();
    const useCase = new CreateOrganizationUseCase(repository);

    const organization = await useCase.execute({
      name: 'Padaria do Paulo',
    });

    expect(organization.id).toBeTruthy();
    expect(organization.name).toBe('Padaria do Paulo');
    expect(organization.createdAt).toBeInstanceOf(Date);
    expect(repository.organizations).toContain(organization);
  });
});
