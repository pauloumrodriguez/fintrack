import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantDb } from '../../database/tenant-db.js';

interface AccountMonthlyRow {
  id: string;
  name: string;
  opening: string;
  closing: string;
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
    if (year < 100) throw new BadRequestException('year must be 0100 or later');
    const from = new Date(Date.UTC(year, monthNumber - 1, 1));
    const until = new Date(Date.UTC(year, monthNumber, 1));

    // Transfers affect balances, but never count as income or expense.
    const rows = await this.tenantDb.run(
      organizationId,
      async (manager) =>
        (await manager.query(
          `
        WITH movements AS (
          SELECT account_id, occurred_at AS happened_at,
            CASE WHEN type = 'INCOME' THEN amount_in_cents::numeric ELSE -amount_in_cents::numeric END AS delta,
            CASE WHEN type = 'INCOME' THEN amount_in_cents::numeric ELSE 0 END AS income,
            CASE WHEN type = 'EXPENSE' THEN amount_in_cents::numeric ELSE 0 END AS expense,
            1 AS transaction_count
          FROM transactions WHERE organization_id = $1
          UNION ALL
          SELECT from_account_id, created_at, -amount_in_cents::numeric, 0, 0, 0
          FROM transfers WHERE organization_id = $1
          UNION ALL
          SELECT to_account_id, created_at, amount_in_cents::numeric, 0, 0, 0
          FROM transfers WHERE organization_id = $1
        )
        SELECT account.id, account.name,
          COALESCE(SUM(CASE WHEN movement.happened_at < $2 THEN movement.delta ELSE 0 END), 0) AS opening,
          COALESCE(SUM(CASE WHEN movement.happened_at < $3 THEN movement.delta ELSE 0 END), 0) AS closing,
          COALESCE(SUM(CASE WHEN movement.happened_at >= $2 AND movement.happened_at < $3 THEN movement.income ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN movement.happened_at >= $2 AND movement.happened_at < $3 THEN movement.expense ELSE 0 END), 0) AS expense,
          COALESCE(SUM(CASE WHEN movement.happened_at >= $2 AND movement.happened_at < $3 THEN movement.transaction_count ELSE 0 END), 0) AS count
        FROM accounts AS account
        LEFT JOIN movements AS movement ON movement.account_id = account.id
        WHERE account.organization_id = $1
        GROUP BY account.id, account.name
        ORDER BY account.name, account.id
      `,
          [organizationId, from, until],
        )) as AccountMonthlyRow[],
    );

    const safeCents = (value: string | number): number => {
      const amount = Number(value);
      if (!Number.isSafeInteger(amount)) {
        throw new BadRequestException(
          'Monthly report exceeds safe integer range',
        );
      }
      return amount;
    };
    const accounts = rows.map((row) => {
      const openingBalanceInCents = safeCents(row.opening);
      const closingBalanceInCents = safeCents(row.closing);
      const incomeInCents = safeCents(row.income);
      const expenseInCents = safeCents(row.expense);
      return {
        id: row.id,
        name: row.name,
        openingBalanceInCents,
        closingBalanceInCents,
        incomeInCents,
        expenseInCents,
        netInCents: safeCents(incomeInCents - expenseInCents),
        transactionCount: safeCents(row.count),
      };
    });
    const sum = (pick: (account: (typeof accounts)[number]) => number) =>
      accounts.reduce((total, account) => safeCents(total + pick(account)), 0);
    return {
      organizationId,
      month,
      openingBalanceInCents: sum((account) => account.openingBalanceInCents),
      closingBalanceInCents: sum((account) => account.closingBalanceInCents),
      incomeInCents: sum((account) => account.incomeInCents),
      expenseInCents: sum((account) => account.expenseInCents),
      netInCents: sum((account) => account.netInCents),
      transactionCount: sum((account) => account.transactionCount),
      accounts,
    };
  }
}
