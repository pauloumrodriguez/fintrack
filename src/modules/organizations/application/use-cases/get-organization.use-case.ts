import { Organization } from '../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../domain/repositories/organization.repository.js';
import { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';

export class GetOrganizationUseCase {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(id: string): Promise<Organization> {
    const organization = await this.repository.findById(id);

    if (!organization) {
      throw new OrganizationNotFoundError(id);
    }

    return organization;
  }
}
