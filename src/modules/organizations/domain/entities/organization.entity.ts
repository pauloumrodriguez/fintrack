export class Organization {
  public readonly id: string;
  public readonly name: string;
  public readonly createdAt: Date;

  constructor(id: string, name: string, createdAt: Date) {
    const normalizedName = name.trim();

    if (normalizedName.length === 0) {
      throw new Error('Organization name is required');
    }

    this.id = id;
    this.name = normalizedName;
    this.createdAt = createdAt;
  }
}
