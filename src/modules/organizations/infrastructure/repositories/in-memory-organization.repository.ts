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

  async findById(id: string): Promise<Organization | null> {
    return (
      this.organizations.find((organization) => organization.id === id) ?? null
    );
  }

  async findByName(name: string): Promise<Organization | null> {
    const normalizedName = name.trim().toLowerCase();

    return (
      this.organizations.find(
        (organization) =>
          organization.name.toLowerCase() === normalizedName,
      ) ?? null
    );
  }
}
