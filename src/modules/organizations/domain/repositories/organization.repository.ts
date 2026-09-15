import { Organization } from '../entities/organization.entity.js';

export abstract class OrganizationRepository {
  abstract save(organization: Organization): Promise<void>;
  abstract findAll(): Promise<Organization[]>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findByName(name: string): Promise<Organization | null>;
}
