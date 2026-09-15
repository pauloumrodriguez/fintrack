import { randomUUID } from 'node:crypto';
import { Organization } from '../../domain/entities/organization.entity.js';
import { OrganizationRepository } from '../../domain/repositories/organization.repository.js';

interface CreateOrganizationInput {
  name: string;
}

export class CreateOrganizationUseCase {
  constructor(private readonly repository: OrganizationRepository) {}

  async execute(input: CreateOrganizationInput): Promise<Organization> {
    const organization = new Organization(
      randomUUID(),
      input.name,
      new Date(),
    );

    await this.repository.save(organization);

    return organization;
  }
}
