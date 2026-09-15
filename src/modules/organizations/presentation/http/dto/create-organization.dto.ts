import { IsString, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @Matches(/\S/, { message: 'name must not be empty' })
  name!: string;
}
