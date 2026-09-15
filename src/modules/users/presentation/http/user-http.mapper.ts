import { User } from '../../domain/entities/user.entity.js';

export class UserHttpMapper {
  static toResponse(user: User) {
    return {
      id: user.id,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
