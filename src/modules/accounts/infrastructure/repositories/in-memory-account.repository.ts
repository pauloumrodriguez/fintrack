import { Account } from '../../domain/entities/account.entity.js';
import { AccountRepository } from '../../domain/repositories/account.repository.js';

export class InMemoryAccountRepository implements AccountRepository {
  public readonly accounts: Account[] = [];

  async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }

  async findById(organizationId: string, id: string): Promise<Account | null> {
    return (
      this.accounts.find(
        (account) =>
          account.organizationId === organizationId && account.id === id,
      ) ?? null
    );
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<Account | null> {
    const normalizedName = name.trim().toLowerCase();
    return (
      this.accounts.find(
        (account) =>
          account.organizationId === organizationId &&
          account.name.toLowerCase() === normalizedName,
      ) ?? null
    );
  }

  async findAllByOrganizationId(organizationId: string): Promise<Account[]> {
    return this.accounts.filter(
      (account) => account.organizationId === organizationId,
    );
  }
}
