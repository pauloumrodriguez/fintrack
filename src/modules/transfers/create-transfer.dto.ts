import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateTransferDto {
  @IsUUID('4') organizationId: string;
  @IsUUID('4') fromAccountId: string;
  @IsUUID('4') toAccountId: string;
  @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) amountInCents: number;
}
