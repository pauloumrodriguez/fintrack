import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case.js';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case.js';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case.js';
import { CategoryExceptionFilter } from './category-exception.filter.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { Roles } from '../../../auth/auth.decorators.js';
import { UserRole } from '../../../users/domain/entities/user.entity.js';

@Controller()
@UseFilters(CategoryExceptionFilter)
export class CategoryController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly getCategory: GetCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
  ) {}

  @Post('categories')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  create(@Body() body: CreateCategoryDto) {
    return this.createCategory.execute(body);
  }

  @Get('organizations/:organizationId/categories')
  list(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
  ) {
    return this.listCategories.execute(organizationId);
  }

  @Get('organizations/:organizationId/categories/:categoryId')
  get(
    @Param('organizationId', new ParseUUIDPipe({ version: '4' }))
    organizationId: string,
    @Param('categoryId', new ParseUUIDPipe({ version: '4' }))
    categoryId: string,
  ) {
    return this.getCategory.execute(organizationId, categoryId);
  }
}
