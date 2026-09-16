import { Organization } from '../../../organizations/domain/entities/organization.entity.js';
import { InMemoryOrganizationRepository } from '../../../organizations/infrastructure/repositories/in-memory-organization.repository.js';
import { InMemoryAccountRepository } from '../../infrastructure/repositories/in-memory-account.repository.js';
import { AccountAlreadyExistsError } from '../errors/account-already-exists.error.js';
import { AccountOrganizationNotFoundError } from '../errors/account-organization-not-found.error.js';
import { CreateAccountUseCase } from './create-account.use-case.js';

describe('CreateAccountUseCase', () => {
  function setup() {
    const accounts = new InMemoryAccountRepository();
    const organizations = new InMemoryOrganizationRepository();
    return {
      accounts,
      organizations,
      useCase: new CreateAccountUseCase(accounts, organizations),
    };
  }

  it('cria uma conta com saldo zero para uma organização existente', async () => {
    const { accounts, organizations, useCase } = setup();
    await organizations.save(new Organization('org-1', 'Padaria', new Date()));

    const account = await useCase.execute({
      organizationId: 'org-1',
      name: '  Caixa  ',
    });

    expect(account.name).toBe('Caixa');
    expect(account.balanceInCents).toBe(0);
    expect(await accounts.findById('org-1', account.id)).toBe(account);
  });

  it('não cria conta para uma organização inexistente', async () => {
    const { useCase } = setup();
    await expect(
      useCase.execute({ organizationId: 'org-1', name: 'Caixa' }),
    ).rejects.toBeInstanceOf(AccountOrganizationNotFoundError);
  });

  it('rejeita nomes repetidos na mesma organização, ignorando maiúsculas', async () => {
    const { organizations, useCase } = setup();
    await organizations.save(new Organization('org-1', 'Padaria', new Date()));
    await useCase.execute({ organizationId: 'org-1', name: 'Caixa' });

    await expect(
      useCase.execute({ organizationId: 'org-1', name: '  CAIXA  ' }),
    ).rejects.toBeInstanceOf(AccountAlreadyExistsError);
  });

  it('permite o mesmo nome em organizações diferentes', async () => {
    const { organizations, useCase } = setup();
    await organizations.save(new Organization('org-1', 'Padaria', new Date()));
    await organizations.save(new Organization('org-2', 'Mercado', new Date()));

    const first = await useCase.execute({
      organizationId: 'org-1',
      name: 'Caixa',
    });
    const second = await useCase.execute({
      organizationId: 'org-2',
      name: 'Caixa',
    });

    expect(first.id).not.toBe(second.id);
  });
});
