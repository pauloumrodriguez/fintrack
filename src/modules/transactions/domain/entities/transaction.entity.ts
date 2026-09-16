export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

interface TransactionProps {
  id: string;
  organizationId: string;
  accountId: string;
  categoryId: string;
  amountInCents: number;
  type: TransactionType;
  description: string;
  occurredAt: Date;
  createdAt: Date;
}

export class Transaction {
  readonly id: string;
  readonly organizationId: string;
  readonly accountId: string;
  readonly categoryId: string;
  readonly amountInCents: number;
  readonly type: TransactionType;
  readonly description: string;
  readonly occurredAt: Date;
  readonly createdAt: Date;

  constructor(props: TransactionProps) {
    if (!Number.isSafeInteger(props.amountInCents) || props.amountInCents <= 0) {
      throw new Error('Transaction amount must be positive whole cents');
    }
    if (!Object.values(TransactionType).includes(props.type)) {
      throw new Error('Transaction type is invalid');
    }
    const description = props.description.trim();
    if (description.length > 200) {
      throw new Error('Transaction description must be at most 200 characters');
    }
    if (
      Number.isNaN(props.occurredAt.getTime()) ||
      Number.isNaN(props.createdAt.getTime())
    ) {
      throw new Error('Transaction dates must be valid');
    }
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.accountId = props.accountId;
    this.categoryId = props.categoryId;
    this.amountInCents = props.amountInCents;
    this.type = props.type;
    this.description = description;
    this.occurredAt = props.occurredAt;
    this.createdAt = props.createdAt;
  }

  get balanceDeltaInCents(): number {
    return this.type === TransactionType.INCOME
      ? this.amountInCents
      : -this.amountInCents;
  }
}
