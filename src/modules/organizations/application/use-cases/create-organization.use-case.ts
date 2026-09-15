import { randomUUID } from 'node:crypto';
import { Organization } from '../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../domain/repositories/organization.repository.js';
import { OrganizationAlreadyExistsError } from '../errors/organization-already-exists.error.js';

interface CreateOrganizationInput {
  name: string;
}

export class CreateOrganizationUseCase {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const organizationWithSameName = await this.repository.findByName(
      input.name,
    );

    if (organizationWithSameName) {
      throw new OrganizationAlreadyExistsError(input.name.trim());
    }

    const organization = new Organization(randomUUID(), input.name, new Date());

    await this.repository.save(organization);

    return organization;
  }
}
