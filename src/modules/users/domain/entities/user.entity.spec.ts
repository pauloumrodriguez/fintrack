import { User, UserRole } from './user.entity.js';

describe('User', () => {
  it('normaliza o nome e o e-mail', () => {
    const user = new User({
      id: 'user-001',
      organizationId: 'org-001',
      name: '  Paulo Rodrigues  ',
      email: '  PAULO@EXAMPLE.COM  ',
      passwordHash: 'hash-da-senha',
      role: UserRole.ADMIN,
      createdAt: new Date(),
    });

    expect(user.name).toBe('Paulo Rodrigues');
    expect(user.email).toBe('paulo@example.com');
  });

  it('não permite criar um usuário sem nome', () => {
    expect(
      () =>
        new User({
          id: 'user-001',
          organizationId: 'org-001',
          name: '   ',
          email: 'paulo@example.com',
          passwordHash: 'hash-da-senha',
          role: UserRole.ADMIN,
          createdAt: new Date(),
        }),
    ).toThrow('User name is required');
  });

  it('não permite criar um usuário com e-mail inválido', () => {
    expect(
      () =>
        new User({
          id: 'user-001',
          organizationId: 'org-001',
          name: 'Paulo',
          email: 'email-invalido',
          passwordHash: 'hash-da-senha',
          role: UserRole.ADMIN,
          createdAt: new Date(),
        }),
    ).toThrow('User email is invalid');
  });
});
