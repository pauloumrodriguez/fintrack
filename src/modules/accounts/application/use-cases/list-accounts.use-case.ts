import { Account } from '../../domain/entities/account.entity.js';
import { AccountRepository } from '../../domain/repositories/account.repository.js';

export class ListAccountsUseCase {
  constructor(private readonly accounts: AccountRepository) {}

  execute(organizationId: string): Promise<Account[]> {
    return this.accounts.findAllByOrganizationId(organizationId);
  }
}
