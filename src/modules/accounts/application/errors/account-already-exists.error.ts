export class AccountAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`An account with name "${name}" already exists in this organization`);
    this.name = 'AccountAlreadyExistsError';
  }
}
