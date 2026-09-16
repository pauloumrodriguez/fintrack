import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionType } from '../../../domain/entities/transaction.entity.js';

export class CreateTransactionDto {
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @IsUUID('4')
  accountId: string;

  @IsUUID('4')
  categoryId: string;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  amountInCents: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
