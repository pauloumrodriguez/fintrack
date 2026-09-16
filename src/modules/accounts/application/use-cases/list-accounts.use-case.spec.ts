import { Account } from '../../domain/entities/account.entity.js';
import { InMemoryAccountRepository } from '../../infrastructure/repositories/in-memory-account.repository.js';
import { ListAccountsUseCase } from './list-accounts.use-case.js';

describe('ListAccountsUseCase', () => {
  it('lista apenas contas da organização solicitada', async () => {
    const accounts = new InMemoryAccountRepository();
    await accounts.save(
      new Account({
        id: 'account-1',
        organizationId: 'org-1',
        name: 'Caixa',
        createdAt: new Date(),
      }),
    );
    await accounts.save(
      new Account({
        id: 'account-2',
        organizationId: 'org-2',
        name: 'Banco',
        createdAt: new Date(),
      }),
    );

    const result = await new ListAccountsUseCase(accounts).execute('org-1');
    expect(result.map((account) => account.id)).toEqual(['account-1']);
  });
});
