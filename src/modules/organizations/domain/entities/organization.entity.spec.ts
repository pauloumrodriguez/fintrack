import { Organization } from './organization.entity.js';

describe('Organization', () => {
  it('não permite criar uma organização sem nome', () => {
    expect(() => new Organization('org-001', '   ', new Date())).toThrow(
      'Organization name is required',
    );
  });

  it('normaliza os espaços no começo e no fim do nome', () => {
    const organization = new Organization(
      'org-001',
      '  Padaria do Paulo  ',
      new Date(),
    );

    expect(organization.name).toBe('Padaria do Paulo');
  });

  it('não permite um nome com mais de 100 caracteres', () => {
    expect(
      () => new Organization('org-001', 'a'.repeat(101), new Date()),
    ).toThrow('Organization name must be at most 100 characters');
  });
});
