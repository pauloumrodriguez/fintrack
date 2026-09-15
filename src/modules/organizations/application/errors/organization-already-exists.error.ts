export class OrganizationAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Organization "${name}" already exists`);
    this.name = 'OrganizationAlreadyExistsError';
  }
}
