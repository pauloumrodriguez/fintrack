import { Account } from '../../domain/entities/account.entity.js';
import { AccountRepository } from '../../domain/repositories/account.repository.js';
import { AccountNotFoundError } from '../errors/account-not-found.error.js';

export class GetAccountUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(organizationId: string, id: string): Promise<Account> {
    const account = await this.accounts.findById(organizationId, id);
    if (!account) {
      throw new AccountNotFoundError(id);
    }
    return account;
  }
}
