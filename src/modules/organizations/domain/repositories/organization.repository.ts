import { Organization } from '../entities/organization.entity.js';

export abstract class OrganizationRepository {
  abstract save(organization: Organization): Promise<void>;
}
