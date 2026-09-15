import { Organization } from './organization.entity.js';

describe('Organization', () => {
  it('não permite criar uma organização sem nome', () => {
    expect(() => new Organization('org-001', '   ', new Date())).toThrow(
      'Organization name is required',
    );
  });
});
