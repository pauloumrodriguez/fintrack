import { Transform } from 'class-transformer';
import { IsEnum, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { CategoryType } from '../../../domain/entities/category.entity.js';

export class CreateCategoryDto {
  @IsUUID('4')
  organizationId: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Matches(/\S/, { message: 'name must not be empty' })
  @MaxLength(100)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}
