export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

interface CategoryProps {
  id: string;
  organizationId: string;
  name: string;
  type: CategoryType;
  createdAt: Date;
}

export class Category {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly type: CategoryType;
  readonly createdAt: Date;

  constructor(props: CategoryProps) {
    const name = props.name.trim();
    if (!name || name.length > 100) {
      throw new Error('Category name must have 1 to 100 characters');
    }
    if (!Object.values(CategoryType).includes(props.type)) {
      throw new Error('Category type is invalid');
    }
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = name;
    this.type = props.type;
    this.createdAt = props.createdAt;
  }
}
