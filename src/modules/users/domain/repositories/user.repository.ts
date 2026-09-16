import { User } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findByEmail(email: string, organizationId?: string): Promise<User | null>;
  abstract findById(id: string, organizationId?: string): Promise<User | null>;
  abstract findAllByOrganizationId(organizationId: string): Promise<User[]>;
}
