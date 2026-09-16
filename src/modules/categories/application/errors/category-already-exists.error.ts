export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super('Category already exists in this organization and type');
  }
}
