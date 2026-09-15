import { Organization } from '../../../organizations/domain/entities/organization.entity.js';
import { InMemoryOrganizationRepository } from '../../../organizations/infrastructure/repositories/in-memory-organization.repository.js';
import { UserRole } from '../../domain/entities/user.entity.js';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository.js';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error.js';
import { UserOrganizationNotFoundError } from '../errors/user-organization-not-found.error.js';
import { PasswordHasher } from '../security/password-hasher.js';
import { CreateUserUseCase } from './create-user.use-case.js';

class FakePasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return `hashed:${plainText}`;
  }
}

describe('CreateUserUseCase', () => {
  function setup() {
    const userRepository = new InMemoryUserRepository();
    const organizationRepository = new InMemoryOrganizationRepository();
    const useCase = new CreateUserUseCase(
      userRepository,
      organizationRepository,
      new FakePasswordHasher(),
    );

    return { useCase, userRepository, organizationRepository };
  }

  it('cria um usuário com a senha protegida', async () => {
    const { useCase, userRepository, organizationRepository } = setup();
    await organizationRepository.save(
      new Organization('org-001', 'Padaria do Paulo', new Date()),
    );

    const user = await useCase.execute({
      organizationId: 'org-001',
      name: 'Paulo',
      email: 'PAULO@EXAMPLE.COM',
      password: 'senha-segura',
      role: UserRole.ADMIN,
    });

    expect(user.email).toBe('paulo@example.com');
    expect(user.passwordHash).toBe('hashed:senha-segura');
    expect(userRepository.users).toHaveLength(1);
  });

  it('não cria usuário para uma organização inexistente', async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({
        organizationId: 'org-inexistente',
        name: 'Paulo',
        email: 'paulo@example.com',
        password: 'senha-segura',
        role: UserRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(UserOrganizationNotFoundError);
  });

  it('não permite dois usuários com o mesmo e-mail', async () => {
    const { useCase, organizationRepository } = setup();
    await organizationRepository.save(
      new Organization('org-001', 'Padaria do Paulo', new Date()),
    );
    const input = {
      organizationId: 'org-001',
      name: 'Paulo',
      email: 'paulo@example.com',
      password: 'senha-segura',
      role: UserRole.ADMIN,
    };

    await useCase.execute(input);

    await expect(
      useCase.execute({ ...input, email: '  PAULO@EXAMPLE.COM ' }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
