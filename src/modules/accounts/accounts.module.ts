import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationRepository } from '../organizations/domain/repositories/organization.repository.js';
import { OrganizationsModule } from '../organizations/organizations.module.js';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case.js';
import { GetAccountUseCase } from './application/use-cases/get-account.use-case.js';
import { ListAccountsUseCase } from './application/use-cases/list-accounts.use-case.js';
import { AccountRepository } from './domain/repositories/account.repository.js';
import { AccountOrmEntity } from './infrastructure/database/typeorm/account.orm-entity.js';
import { TypeOrmAccountRepository } from './infrastructure/database/typeorm/typeorm-account.repository.js';
import { AccountController } from './presentation/http/account.controller.js';

@Module({
  imports: [OrganizationsModule, TypeOrmModule.forFeature([AccountOrmEntity])],
  controllers: [AccountController],
  providers: [
    { provide: AccountRepository, useClass: TypeOrmAccountRepository },
    {
      provide: CreateAccountUseCase,
      useFactory: (
        accounts: AccountRepository,
        organizations: OrganizationRepository,
      ) => new CreateAccountUseCase(accounts, organizations),
      inject: [AccountRepository, OrganizationRepository],
    },
    {
      provide: GetAccountUseCase,
      useFactory: (accounts: AccountRepository) =>
        new GetAccountUseCase(accounts),
      inject: [AccountRepository],
    },
    {
      provide: ListAccountsUseCase,
      useFactory: (accounts: AccountRepository) =>
        new ListAccountsUseCase(accounts),
      inject: [AccountRepository],
    },
  ],
  exports: [AccountRepository],
})
export class AccountsModule {}
