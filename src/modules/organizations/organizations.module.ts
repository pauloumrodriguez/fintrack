import { Module } from '@nestjs/common';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case.js';
import { GetOrganizationUseCase } from './application/use-cases/get-organization.use-case.js';
import { ListOrganizationsUseCase } from './application/use-cases/list-organizations.use-case.js';
import { InMemoryOrganizationRepository } from './infrastructure/repositories/in-memory-organization.repository.js';
import { OrganizationController } from './presentation/http/organization.controller.js';

@Module({
  controllers: [OrganizationController],
  providers: [
    InMemoryOrganizationRepository,
    {
      provide: CreateOrganizationUseCase,
      useFactory: (repository: InMemoryOrganizationRepository) =>
        new CreateOrganizationUseCase(repository),
      inject: [InMemoryOrganizationRepository],
    },
    {
      provide: ListOrganizationsUseCase,
      useFactory: (repository: InMemoryOrganizationRepository) =>
        new ListOrganizationsUseCase(repository),
      inject: [InMemoryOrganizationRepository],
    },
    {
      provide: GetOrganizationUseCase,
      useFactory: (repository: InMemoryOrganizationRepository) =>
        new GetOrganizationUseCase(repository),
      inject: [InMemoryOrganizationRepository],
    },
  ],
})
export class OrganizationsModule {}
