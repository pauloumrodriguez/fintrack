export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  VIEWER = 'VIEWER',
}

interface UserProps {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  public readonly id: string;
  public readonly organizationId: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    const normalizedName = props.name.trim();
    const normalizedEmail = props.email.trim().toLowerCase();

    if (normalizedName.length === 0) {
      throw new Error('User name is required');
    }

    if (normalizedName.length > 100) {
      throw new Error('User name must be at most 100 characters');
    }

    if (!normalizedEmail.includes('@')) {
      throw new Error('User email is invalid');
    }

    if (props.passwordHash.length === 0) {
      throw new Error('User password hash is required');
    }

    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = normalizedName;
    this.email = normalizedEmail;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }
}
