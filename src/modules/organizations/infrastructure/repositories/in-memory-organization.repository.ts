import { Organization } from '../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../domain/repositories/organization.repository.js';

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public readonly organizations: Organization[] = [];

  async save(organization: Organization): Promise<void> {
    this.organizations.push(organization);
  }

  async findAll(): Promise<Organization[]> {
    return [...this.organizations];
  }
}
