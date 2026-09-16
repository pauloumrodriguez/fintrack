import { Account } from './account.entity.js';

describe('Account', () => {
  it('começa com saldo zero e normaliza o nome', () => {
    const account = new Account({
      id: 'account-001',
      organizationId: 'org-001',
      name: '  Conta principal  ',
      createdAt: new Date(),
    });

    expect(account.name).toBe('Conta principal');
    expect(account.balanceInCents).toBe(0);
  });

  it('não aceita um nome formado só por espaços', () => {
    expect(
      () =>
        new Account({
          id: 'account-001',
          organizationId: 'org-001',
          name: '   ',
          createdAt: new Date(),
        }),
    ).toThrow('Account name is required');
  });

  it('não aceita saldo fracionário em centavos', () => {
    expect(
      () =>
        new Account({
          id: 'account-001',
          organizationId: 'org-001',
          name: 'Conta principal',
          balanceInCents: 10.5,
          createdAt: new Date(),
        }),
    ).toThrow('Account balance must be an integer number of cents');
  });
});
