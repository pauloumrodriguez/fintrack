import { Account } from '../../domain/entities/account.entity.js';
import { InMemoryAccountRepository } from '../../infrastructure/repositories/in-memory-account.repository.js';
import { AccountNotFoundError } from '../errors/account-not-found.error.js';
import { GetAccountUseCase } from './get-account.use-case.js';

describe('GetAccountUseCase', () => {
  it('não retorna uma conta consultada com outra organização', async () => {
    const accounts = new InMemoryAccountRepository();
    await accounts.save(
      new Account({
        id: 'account-1',
        organizationId: 'org-1',
        name: 'Caixa',
        createdAt: new Date(),
      }),
    );

    const useCase = new GetAccountUseCase(accounts);
    await expect(useCase.execute('org-2', 'account-1')).rejects.toBeInstanceOf(
      AccountNotFoundError,
    );
    expect((await useCase.execute('org-1', 'account-1')).name).toBe('Caixa');
  });
});
