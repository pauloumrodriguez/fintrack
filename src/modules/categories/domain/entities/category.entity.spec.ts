import { Category, CategoryType } from './category.entity.js';

describe('Category', () => {
  it('normaliza o nome e conserva o tipo', () => {
    const category = new Category({
      id: 'category-1',
      organizationId: 'org-1',
      name: '  Alimentação  ',
      type: CategoryType.EXPENSE,
      createdAt: new Date(),
    });
    expect(category.name).toBe('Alimentação');
    expect(category.type).toBe(CategoryType.EXPENSE);
  });

  it('rejeita nome vazio', () => {
    expect(
      () =>
        new Category({
          id: 'category-1',
          organizationId: 'org-1',
          name: ' ',
          type: CategoryType.EXPENSE,
          createdAt: new Date(),
        }),
    ).toThrow();
  });
});
