import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRepository } from '../accounts/domain/repositories/account.repository.js';
import { AccountsModule } from '../accounts/accounts.module.js';
import { CategoryRepository } from '../categories/domain/repositories/category.repository.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case.js';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case.js';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case.js';
import { TransactionRepository } from './domain/repositories/transaction.repository.js';
import { TransactionOrmEntity } from './infrastructure/database/typeorm/transaction.orm-entity.js';
import { TypeOrmTransactionRepository } from './infrastructure/database/typeorm/typeorm-transaction.repository.js';
import { TransactionController } from './presentation/http/transaction.controller.js';

@Module({
  imports: [
    AccountsModule,
    CategoriesModule,
    TypeOrmModule.forFeature([TransactionOrmEntity]),
  ],
  controllers: [TransactionController],
  providers: [
    { provide: TransactionRepository, useClass: TypeOrmTransactionRepository },
    {
      provide: CreateTransactionUseCase,
      useFactory: (
        transactions: TransactionRepository,
        accounts: AccountRepository,
        categories: CategoryRepository,
      ) => new CreateTransactionUseCase(transactions, accounts, categories),
      inject: [TransactionRepository, AccountRepository, CategoryRepository],
    },
    {
      provide: GetTransactionUseCase,
      useFactory: (transactions: TransactionRepository) =>
        new GetTransactionUseCase(transactions),
      inject: [TransactionRepository],
    },
    {
      provide: ListTransactionsUseCase,
      useFactory: (transactions: TransactionRepository) =>
        new ListTransactionsUseCase(transactions),
      inject: [TransactionRepository],
    },
  ],
})
export class TransactionsModule {}
