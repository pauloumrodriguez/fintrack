export class OrganizationNotFoundError extends Error {
  constructor(id: string) {
    super(`Organization "${id}" was not found`);
    this.name = 'OrganizationNotFoundError';
  }
}
