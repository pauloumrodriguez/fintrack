import { randomUUID } from 'node:crypto';
import { OrganizationRepository } from '../../../organizations/domain/repositories/organization.repository.js';
import { Account } from '../../domain/entities/account.entity.js';
import { AccountRepository } from '../../domain/repositories/account.repository.js';
import { AccountAlreadyExistsError } from '../errors/account-already-exists.error.js';
import { AccountOrganizationNotFoundError } from '../errors/account-organization-not-found.error.js';

interface CreateAccountInput {
  organizationId: string;
  name: string;
}

export class CreateAccountUseCase {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly organizations: OrganizationRepository,
  ) {}

  async execute(input: CreateAccountInput): Promise<Account> {
    const organization = await this.organizations.findById(
      input.organizationId,
    );
    if (!organization) {
      throw new AccountOrganizationNotFoundError(input.organizationId);
    }

    const existing = await this.accounts.findByName(
      input.organizationId,
      input.name,
    );
    if (existing) {
      throw new AccountAlreadyExistsError(input.name.trim());
    }

    const account = new Account({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      createdAt: new Date(),
    });
    await this.accounts.save(account);
    return account;
  }
}
