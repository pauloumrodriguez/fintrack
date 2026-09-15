import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../domain/entities/user.entity.js';

export class CreateUserDto {
  @IsUUID('4')
  organizationId: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/\S/, { message: 'name must not be empty' })
  @Length(1, 100)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @Length(3, 254)
  email: string;

  @IsString()
  @Length(8, 128)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
