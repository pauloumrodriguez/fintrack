import { User } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';

export class InMemoryUserRepository implements UserRepository {
  public readonly users: User[] = [];

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async findByEmail(email: string, organizationId?: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.users.find((user) => user.email === normalizedEmail &&
      (!organizationId || user.organizationId === organizationId)) ?? null;
  }

  async findById(id: string, organizationId?: string): Promise<User | null> {
    return this.users.find((user) => user.id === id &&
      (!organizationId || user.organizationId === organizationId)) ?? null;
  }

  async findAllByOrganizationId(organizationId: string): Promise<User[]> {
    return this.users.filter((user) => user.organizationId === organizationId);
  }
}
