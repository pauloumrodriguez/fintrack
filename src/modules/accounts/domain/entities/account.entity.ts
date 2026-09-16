interface AccountProps {
  id: string;
  organizationId: string;
  name: string;
  balanceInCents?: number;
  createdAt: Date;
}

export class Account {
  public readonly id: string;
  public readonly organizationId: string;
  public readonly name: string;
  public readonly balanceInCents: number;
  public readonly createdAt: Date;

  constructor(props: AccountProps) {
    const normalizedName = props.name.trim();

    if (normalizedName.length === 0) {
      throw new Error('Account name is required');
    }

    if (normalizedName.length > 100) {
      throw new Error('Account name must be at most 100 characters');
    }

    const balanceInCents = props.balanceInCents ?? 0;
    if (!Number.isSafeInteger(balanceInCents)) {
      throw new Error('Account balance must be an integer number of cents');
    }

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = normalizedName;
    this.balanceInCents = balanceInCents;
    this.createdAt = props.createdAt;
  }

  withBalanceChange(deltaInCents: number): Account {
    const nextBalance = this.balanceInCents + deltaInCents;
    if (!Number.isSafeInteger(nextBalance)) {
      throw new Error('Account balance exceeds safe integer range');
    }
    return new Account({
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      balanceInCents: nextBalance,
      createdAt: this.createdAt,
    });
  }
}
