export class AccountOrganizationNotFoundError extends Error {
  constructor(organizationId: string) {
    super(`Organization "${organizationId}" was not found`);
    this.name = 'AccountOrganizationNotFoundError';
  }
}
