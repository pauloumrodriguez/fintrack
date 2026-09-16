import { Account } from '../../domain/entities/account.entity.js';

export class AccountHttpMapper {
  static toResponse(account: Account) {
    return {
      id: account.id,
      organizationId: account.organizationId,
      name: account.name,
      balanceInCents: account.balanceInCents,
      createdAt: account.createdAt,
    };
  }
}
