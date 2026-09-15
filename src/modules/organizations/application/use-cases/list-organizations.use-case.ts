import { Organization } from '../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../domain/repositories/organization.repository.js';

export class ListOrganizationsUseCase {
  constructor(private readonly repository: OrganizationRepository) {}

  execute(): Promise<Organization[]> {
    return this.repository.findAll();
  }
}
