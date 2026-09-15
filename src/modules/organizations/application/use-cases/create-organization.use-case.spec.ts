import { CreateOrganizationUseCase } from './create-organization.use-case.js';

describe('CreateOrganizationUseCase', () => {
  it('cria uma organização com nome válido', () => {
    const useCase = new CreateOrganizationUseCase();

    const organization = useCase.execute({
      name: 'Padaria do Paulo',
    });

    expect(organization.id).toBeTruthy();
    expect(organization.name).toBe('Padaria do Paulo');
    expect(organization.createdAt).toBeInstanceOf(Date);
  });
});
