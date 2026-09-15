import { randomUUID } from 'node:crypto';
import { Organization } from '../../domain/entities/organization.entity.js';

interface CreateOrganizationInput {
  name: string;
}

export class CreateOrganizationUseCase {
  execute(input: CreateOrganizationInput): Organization {
    return new Organization(randomUUID(), input.name, new Date());
  }
}
