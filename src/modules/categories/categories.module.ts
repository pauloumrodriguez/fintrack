import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationRepository } from '../organizations/domain/repositories/organization.repository.js';
import { OrganizationsModule } from '../organizations/organizations.module.js';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case.js';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case.js';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case.js';
import { CategoryRepository } from './domain/repositories/category.repository.js';
import { CategoryOrmEntity } from './infrastructure/database/typeorm/category.orm-entity.js';
import { TypeOrmCategoryRepository } from './infrastructure/database/typeorm/typeorm-category.repository.js';
import { CategoryController } from './presentation/http/category.controller.js';

@Module({
  imports: [OrganizationsModule, TypeOrmModule.forFeature([CategoryOrmEntity])],
  controllers: [CategoryController],
  providers: [
    { provide: CategoryRepository, useClass: TypeOrmCategoryRepository },
    {
      provide: CreateCategoryUseCase,
      useFactory: (
        categories: CategoryRepository,
        organizations: OrganizationRepository,
      ) => new CreateCategoryUseCase(categories, organizations),
      inject: [CategoryRepository, OrganizationRepository],
    },
    {
      provide: GetCategoryUseCase,
      useFactory: (categories: CategoryRepository) =>
        new GetCategoryUseCase(categories),
      inject: [CategoryRepository],
    },
    {
      provide: ListCategoriesUseCase,
      useFactory: (categories: CategoryRepository) =>
        new ListCategoriesUseCase(categories),
      inject: [CategoryRepository],
    },
  ],
  exports: [CategoryRepository],
})
export class CategoriesModule {}
