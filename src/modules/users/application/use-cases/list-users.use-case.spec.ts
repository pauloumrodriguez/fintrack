import { User, UserRole } from '../../domain/entities/user.entity.js';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository.js';
import { ListUsersUseCase } from './list-users.use-case.js';

describe('ListUsersUseCase', () => {
  it('lista somente usuários da organização informada', async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new ListUsersUseCase(repository);
    const commonProps = {
      name: 'Usuário',
      email: 'user@example.com',
      passwordHash: 'hash',
      role: UserRole.VIEWER,
      createdAt: new Date(),
    };

    await repository.save(
      new User({ id: 'user-001', organizationId: 'org-001', ...commonProps }),
    );
    await repository.save(
      new User({
        id: 'user-002',
        organizationId: 'org-002',
        ...commonProps,
        email: 'other@example.com',
      }),
    );

    const users = await useCase.execute('org-001');

    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe('user-001');
  });
});
