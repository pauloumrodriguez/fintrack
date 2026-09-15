import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case.js';
import { GetOrganizationUseCase } from './application/use-cases/get-organization.use-case.js';
import { ListOrganizationsUseCase } from './application/use-cases/list-organizations.use-case.js';
import { OrganizationRepository } from './domain/repositories/organization.repository.js';
import { OrganizationOrmEntity } from './infrastructure/database/typeorm/organization.orm-entity.js';
import { TypeOrmOrganizationRepository } from './infrastructure/database/typeorm/typeorm-organization.repository.js';
import { OrganizationController } from './presentation/http/organization.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationOrmEntity])],
  controllers: [OrganizationController],
  providers: [
    {
      provide: OrganizationRepository,
      useClass: TypeOrmOrganizationRepository,
    },
    {
      provide: CreateOrganizationUseCase,
      useFactory: (repository: OrganizationRepository) =>
        new CreateOrganizationUseCase(repository),
      inject: [OrganizationRepository],
    },
    {
      provide: ListOrganizationsUseCase,
      useFactory: (repository: OrganizationRepository) =>
        new ListOrganizationsUseCase(repository),
      inject: [OrganizationRepository],
    },
    {
      provide: GetOrganizationUseCase,
      useFactory: (repository: OrganizationRepository) =>
        new GetOrganizationUseCase(repository),
      inject: [OrganizationRepository],
    },
  ],
  exports: [OrganizationRepository],
})
export class OrganizationsModule {}
