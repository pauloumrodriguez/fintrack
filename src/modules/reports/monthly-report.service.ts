import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantDb } from '../../database/tenant-db.js';
import { TransactionOrmEntity } from '../transactions/infrastructure/database/typeorm/transaction.orm-entity.js';

interface MonthlyTotals {
  income: string;
  expense: string;
  count: string;
}

@Injectable()
export class MonthlyReportService {
  constructor(private readonly tenantDb: TenantDb) {}

  async get(organizationId: string, month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException('month must be YYYY-MM');
    }
    const [year, monthNumber] = month.split('-').map(Number);
    const from = new Date(Date.UTC(year, monthNumber - 1, 1));
    const until = new Date(Date.UTC(year, monthNumber, 1));
    const totals = await this.tenantDb.run(organizationId, (manager) => manager.getRepository(TransactionOrmEntity)
      .createQueryBuilder('transaction')
      .select(
        "COALESCE(SUM(CASE WHEN transaction.type = 'INCOME' THEN transaction.amountInCents ELSE 0 END), 0)",
        'income',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN transaction.type = 'EXPENSE' THEN transaction.amountInCents ELSE 0 END), 0)",
        'expense',
      )
      .addSelect('COUNT(*)', 'count')
      .where('transaction.organizationId = :organizationId', { organizationId })
      .andWhere(
        'transaction.occurredAt >= :from AND transaction.occurredAt < :until',
        { from, until },
      )
      .getRawOne<MonthlyTotals>());
    const incomeInCents = Number(totals?.income ?? 0);
    const expenseInCents = Number(totals?.expense ?? 0);
    const netInCents = incomeInCents - expenseInCents;
    if (
      ![incomeInCents, expenseInCents, netInCents].every(Number.isSafeInteger)
    ) {
      throw new BadRequestException(
        'Monthly report exceeds safe integer range',
      );
    }
    return {
      organizationId,
      month,
      incomeInCents,
      expenseInCents,
      netInCents,
      transactionCount: Number(totals?.count ?? 0),
    };
  }
}
