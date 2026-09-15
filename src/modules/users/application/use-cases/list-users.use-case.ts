import { User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(organizationId: string): Promise<User[]> {
    return this.userRepository.findAllByOrganizationId(organizationId);
  }
}
