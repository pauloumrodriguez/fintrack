import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from '../organizations/organizations.module.js';
import { OrganizationRepository } from '../organizations/domain/repositories/organization.repository.js';
import { PasswordHasher } from './application/security/password-hasher.js';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case.js';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case.js';
import { UserRepository } from './domain/repositories/user.repository.js';
import { UserOrmEntity } from './infrastructure/database/typeorm/user.orm-entity.js';
import { TypeOrmUserRepository } from './infrastructure/database/typeorm/typeorm-user.repository.js';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher.js';
import { UserController } from './presentation/http/user.controller.js';

@Module({
  imports: [OrganizationsModule, TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    {
      provide: CreateUserUseCase,
      useFactory: (
        userRepository: UserRepository,
        organizationRepository: OrganizationRepository,
        passwordHasher: PasswordHasher,
      ) =>
        new CreateUserUseCase(
          userRepository,
          organizationRepository,
          passwordHasher,
        ),
      inject: [UserRepository, OrganizationRepository, PasswordHasher],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (userRepository: UserRepository) =>
        new ListUsersUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
  exports: [UserRepository],
})
export class UsersModule {}
