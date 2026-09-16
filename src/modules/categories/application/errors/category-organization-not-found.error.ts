export class CategoryOrganizationNotFoundError extends Error {
  constructor() {
    super('Organization was not found');
  }
}
