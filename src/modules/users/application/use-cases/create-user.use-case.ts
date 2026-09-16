import { randomUUID } from 'node:crypto';
import { OrganizationRepository } from '../../../organizations/domain/repositories/organization.repository.js';
import { User, UserRole } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error.js';
import { UserOrganizationNotFoundError } from '../errors/user-organization-not-found.error.js';
import { PasswordHasher } from '../security/password-hasher.js';

interface CreateUserInput {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const organization = await this.organizationRepository.findById(
      input.organizationId,
    );

    if (!organization) {
      throw new UserOrganizationNotFoundError(input.organizationId);
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const userWithSameEmail =
      await this.userRepository.findByEmail(normalizedEmail, input.organizationId);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = new User({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      role: input.role,
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    return user;
  }
}
