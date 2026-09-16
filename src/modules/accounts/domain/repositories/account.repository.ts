import { Account } from '../entities/account.entity.js';

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract findById(organizationId: string, id: string): Promise<Account | null>;
  abstract findByName(
    organizationId: string,
    name: string,
  ): Promise<Account | null>;
  abstract findAllByOrganizationId(organizationId: string): Promise<Account[]>;
}
