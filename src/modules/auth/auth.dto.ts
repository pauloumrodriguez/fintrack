import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsUUID, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsUUID('4') organizationId: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;
  @IsString() password: string;
}

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/\S/)
  @Length(1, 100)
  organizationName: string;
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/\S/)
  @Length(1, 100)
  name: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email: string;
  @IsString() @Length(8, 128) password: string;
}
