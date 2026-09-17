import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import dataSource from '../src/database/data-source.js';
import { AccountOrmEntity } from '../src/modules/accounts/infrastructure/database/typeorm/account.orm-entity.js';
import { CategoryOrmEntity } from '../src/modules/categories/infrastructure/database/typeorm/category.orm-entity.js';
import { OrganizationOrmEntity } from '../src/modules/organizations/infrastructure/database/typeorm/organization.orm-entity.js';
import { TransactionOrmEntity } from '../src/modules/transactions/infrastructure/database/typeorm/transaction.orm-entity.js';
import { TransferOrmEntity } from '../src/modules/transfers/transfer.orm-entity.js';
import { UserOrmEntity } from '../src/modules/users/infrastructure/database/typeorm/user.orm-entity.js';

describe('Auth, transfers and reports with PostgreSQL', () => {
  let app: INestApplication;
  let appDatabase: DataSource;
  const organizationIds: string[] = [];

  beforeAll(async () => {
    await dataSource.initialize();
    appDatabase = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
    });
    await appDatabase.initialize();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    for (const organizationId of organizationIds) {
      await dataSource
        .getRepository(TransferOrmEntity)
        .delete({ organizationId });
      await dataSource
        .getRepository(TransactionOrmEntity)
        .delete({ organizationId });
      await dataSource
        .getRepository(CategoryOrmEntity)
        .delete({ organizationId });
      await dataSource
        .getRepository(AccountOrmEntity)
        .delete({ organizationId });
      await dataSource.getRepository(UserOrmEntity).delete({ organizationId });
      await dataSource
        .getRepository(OrganizationOrmEntity)
        .delete({ id: organizationId });
    }
    await app.close();
    await appDatabase.destroy();
    await dataSource.destroy();
  });

  it('protege as rotas, transfere saldo atomicamente e soma o mês sem transferências', async () => {
    await request(app.getHttpServer()).get('/organizations').expect(401);
    const email = `owner-${randomUUID()}@example.com`;
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Padaria Integração',
        name: 'Paulo',
        email,
        password: 'senha-forte-123',
      })
      .expect(201);
    const registered = registration.body as {
      organization: { id: string };
      accessToken: string;
      user: { role: string; passwordHash?: string };
    };
    organizationIds.push(registered.organization.id);
    expect(registered.user.role).toBe('ADMIN');
    expect(registered.user.passwordHash).toBeUndefined();
    const organizationId = registered.organization.id;
    const secondRegistration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: `Outra ${randomUUID()}`,
        name: 'Outro Paulo',
        email,
        password: 'senha-forte-123',
      })
      .expect(201);
    const secondOrganizationId = (
      secondRegistration.body as { organization: { id: string } }
    ).organization.id;
    organizationIds.push(secondOrganizationId);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        organizationId: secondOrganizationId,
        email,
        password: 'senha-forte-123',
      })
      .expect(201);
    const duplicateName = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Padaria Integração',
        name: 'Outra Pessoa',
        email: `new-${randomUUID()}@example.com`,
        password: 'senha-forte-123',
      })
      .expect(409);
    expect((duplicateName.body as { message: string }).message).toBe(
      'Organization name already registered',
    );
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ organizationId, email, password: 'senha-forte-123' })
      .expect(201);
    const token = (login.body as { accessToken: string }).accessToken;
    expect(token).toBeTruthy();
    const provisioned = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Nova unidade ${randomUUID()}` })
      .expect(201);
    const provisionedBody = provisioned.body as {
      id: string;
      accessToken: string;
      admin: { organizationId: string };
    };
    organizationIds.push(provisionedBody.id);
    expect(provisionedBody.admin.organizationId).toBe(provisionedBody.id);
    await request(app.getHttpServer())
      .get(`/organizations/${provisionedBody.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/organizations/${provisionedBody.id}`)
      .set('Authorization', `Bearer ${provisionedBody.accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ organizationId, email, password: 'errada' })
      .expect(401);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer inválido')
      .expect(401);

    const createAccount = async (name: string) => {
      const response = await request(app.getHttpServer())
        .post('/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(201);
      return (response.body as { id: string }).id;
    };
    const fromAccountId = await createAccount('Caixa');
    const toAccountId = await createAccount('Reserva');
    await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ organizationId: randomUUID(), name: 'Conta proibida' })
      .expect(403);
    const category = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ organizationId, name: 'Vendas', type: 'INCOME' })
      .expect(201);
    const categoryId = (category.body as { id: string }).id;
    const occurredAt = new Date().toISOString();
    const month = occurredAt.slice(0, 7);
    const incomeInput = {
      organizationId,
      accountId: fromAccountId,
      categoryId,
      amountInCents: 500,
      type: 'INCOME',
      occurredAt,
    };
    const incomeKey = randomUUID();
    const incomeResponse = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', incomeKey)
      .send(incomeInput)
      .expect(201);
    expect(incomeResponse.body).not.toHaveProperty('requestHash');
    expect(incomeResponse.body).not.toHaveProperty('idempotencyKey');
    const replay = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', incomeKey)
      .send(incomeInput)
      .expect(201);
    expect((replay.body as { id: string }).id).toBe(
      (incomeResponse.body as { id: string }).id,
    );
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', incomeKey)
      .send({ ...incomeInput, amountInCents: 501 })
      .expect(409);
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(incomeInput)
      .expect(400);
    const transfer = {
      organizationId,
      fromAccountId,
      toAccountId,
      amountInCents: 200,
    };
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send(transfer)
      .expect(400);
    const transferKey = randomUUID();
    const firstTransfer = await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', transferKey)
      .send(transfer)
      .expect(201);
    expect(firstTransfer.body).not.toHaveProperty('requestHash');
    expect(firstTransfer.body).not.toHaveProperty('idempotencyKey');
    const transferReplay = await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', transferKey)
      .send(transfer)
      .expect(201);
    expect((transferReplay.body as { id: string }).id).toBe(
      (firstTransfer.body as { id: string }).id,
    );
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', transferKey)
      .send({ ...transfer, amountInCents: 201 })
      .expect(409);
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', randomUUID())
      .send({ ...transfer, amountInCents: 400 })
      .expect(409);
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', randomUUID())
      .send({ ...transfer, toAccountId: fromAccountId })
      .expect(400);
    const expenseCategory = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ organizationId, name: 'Compras', type: 'EXPENSE' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', randomUUID())
      .send({
        organizationId,
        accountId: toAccountId,
        categoryId: (expenseCategory.body as { id: string }).id,
        amountInCents: 100,
        type: 'EXPENSE',
        occurredAt,
      })
      .expect(201);
    const accounts = await dataSource
      .getRepository(AccountOrmEntity)
      .findBy({ organizationId });
    expect(
      accounts.find((account) => account.id === fromAccountId)?.balanceInCents,
    ).toBe(300);
    expect(
      accounts.find((account) => account.id === toAccountId)?.balanceInCents,
    ).toBe(100);
    expect(
      await dataSource
        .getRepository(TransferOrmEntity)
        .countBy({ organizationId }),
    ).toBe(1);
    const report = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/reports/monthly?month=${month}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(report.body).toMatchObject({
      incomeInCents: 500,
      expenseInCents: 100,
      netInCents: 400,
      transactionCount: 2,
      openingBalanceInCents: 0,
      closingBalanceInCents: 400,
    });
    const accountSummaries = (
      report.body as {
        accounts: Array<{
          id: string;
          openingBalanceInCents: number;
          closingBalanceInCents: number;
        }>;
      }
    ).accounts;
    expect(
      accountSummaries.find((account) => account.id === fromAccountId),
    ).toMatchObject({
      openingBalanceInCents: 0,
      closingBalanceInCents: 300,
    });
    expect(
      accountSummaries.find((account) => account.id === toAccountId),
    ).toMatchObject({
      openingBalanceInCents: 0,
      closingBalanceInCents: 100,
    });
    const nextMonth = new Date(
      Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 1),
    )
      .toISOString()
      .slice(0, 7);
    const followingReport = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/reports/monthly?month=${nextMonth}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(followingReport.body).toMatchObject({
      openingBalanceInCents: 400,
      closingBalanceInCents: 400,
      incomeInCents: 0,
      expenseInCents: 0,
    });
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/reports/monthly?month=2026-13`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const viewerEmail = `viewer-${randomUUID()}@example.com`;
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId,
        name: 'Leitor',
        email: viewerEmail,
        password: 'senha-forte-123',
        role: 'VIEWER',
      })
      .expect(201);
    const viewerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ organizationId, email: viewerEmail, password: 'senha-forte-123' })
      .expect(201);
    const viewerToken = (viewerLogin.body as { accessToken: string })
      .accessToken;
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${viewerToken}`)
      .set('Idempotency-Key', randomUUID())
      .send(transfer)
      .expect(403);
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${viewerToken}`)
      .set('Idempotency-Key', randomUUID())
      .send(incomeInput)
      .expect(403);
    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: `Proibida ${randomUUID()}` })
      .expect(403);
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/reports/monthly?month=${month}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/organizations/${randomUUID()}/accounts`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/organizations/${randomUUID()}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);

    const managerEmail = `manager-${randomUUID()}@example.com`;
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId,
        name: 'Gerente',
        email: managerEmail,
        password: 'senha-forte-123',
        role: 'FINANCE_MANAGER',
      })
      .expect(201);
    const managerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        organizationId,
        email: managerEmail,
        password: 'senha-forte-123',
      })
      .expect(201);
    const managerToken = (managerLogin.body as { accessToken: string })
      .accessToken;
    const managerAccount = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ organizationId, name: 'Conta do gerente' })
      .expect(201);
    const managerAccountId = (managerAccount.body as { id: string }).id;
    const concurrentKey = randomUUID();
    const concurrentInput = {
      ...incomeInput,
      accountId: managerAccountId,
      amountInCents: 50,
    };
    const repeated = await Promise.all(
      [1, 2].map(() =>
        request(app.getHttpServer())
          .post('/transactions')
          .set('Authorization', `Bearer ${managerToken}`)
          .set('Idempotency-Key', concurrentKey)
          .send(concurrentInput),
      ),
    );
    expect(repeated.map((result) => result.status)).toEqual([201, 201]);
    expect((repeated[0].body as { id: string }).id).toBe(
      (repeated[1].body as { id: string }).id,
    );
    const managerBalance = await dataSource
      .getRepository(AccountOrmEntity)
      .findOneByOrFail({ id: managerAccountId });
    expect(managerBalance.balanceInCents).toBe(50);
    expect(
      await dataSource
        .getRepository(TransactionOrmEntity)
        .countBy({ organizationId, idempotencyKey: concurrentKey }),
    ).toBe(1);
    const secondManagerAccountId = await createAccount('Reserva do gerente');
    const repeatedTransferKey = randomUUID();
    const repeatedTransfer = await Promise.all(
      [1, 2].map(() =>
        request(app.getHttpServer())
          .post('/transfers')
          .set('Authorization', `Bearer ${managerToken}`)
          .set('Idempotency-Key', repeatedTransferKey)
          .send({
            fromAccountId: managerAccountId,
            toAccountId: secondManagerAccountId,
            amountInCents: 20,
          }),
      ),
    );
    expect(repeatedTransfer.map((result) => result.status)).toEqual([201, 201]);
    expect((repeatedTransfer[0].body as { id: string }).id).toBe(
      (repeatedTransfer[1].body as { id: string }).id,
    );
    expect(
      (
        await dataSource
          .getRepository(AccountOrmEntity)
          .findOneByOrFail({ id: managerAccountId })
      ).balanceInCents,
    ).toBe(30);
    expect(
      (
        await dataSource
          .getRepository(AccountOrmEntity)
          .findOneByOrFail({ id: secondManagerAccountId })
      ).balanceInCents,
    ).toBe(20);
    expect(
      await dataSource
        .getRepository(TransferOrmEntity)
        .countBy({ organizationId, idempotencyKey: repeatedTransferKey }),
    ).toBe(1);
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        organizationId,
        name: 'Sem permissão',
        email: `blocked-${randomUUID()}@example.com`,
        password: 'senha-forte-123',
        role: 'ADMIN',
      })
      .expect(403);
    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: `Proibida ${randomUUID()}` })
      .expect(403);

    // Both requests see the same initial 300 cents, but only one may debit 200.
    const concurrent = await Promise.all(
      [1, 2].map(() =>
        request(app.getHttpServer())
          .post('/transfers')
          .set('Authorization', `Bearer ${token}`)
          .set('Idempotency-Key', randomUUID())
          .send({ ...transfer, amountInCents: 200 }),
      ),
    );
    expect(
      concurrent.map((result) => result.status).sort((a, b) => a - b),
    ).toEqual([201, 409]);
    const balances = await dataSource
      .getRepository(AccountOrmEntity)
      .findBy({ organizationId });
    expect(
      balances.find((account) => account.id === fromAccountId)?.balanceInCents,
    ).toBe(100);
    expect(
      balances.find((account) => account.id === toAccountId)?.balanceInCents,
    ).toBe(300);

    const otherRegistration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: `Outra ${randomUUID()}`,
        name: 'Outra Pessoa',
        email: `other-${randomUUID()}@example.com`,
        password: 'senha-forte-123',
      })
      .expect(201);
    const otherOrganizationId = (
      otherRegistration.body as { organization: { id: string } }
    ).organization.id;
    organizationIds.push(otherOrganizationId);
    const otherAccount = await request(app.getHttpServer())
      .post('/accounts')
      .set(
        'Authorization',
        `Bearer ${(otherRegistration.body as { accessToken: string }).accessToken}`,
      )
      .send({ organizationId: otherOrganizationId, name: 'Outra conta' })
      .expect(201);
    const otherToken = (otherRegistration.body as { accessToken: string })
      .accessToken;
    const otherCategory = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Vendas', type: 'INCOME' })
      .expect(201);
    const otherTransaction = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Idempotency-Key', incomeKey)
      .send({
        accountId: (otherAccount.body as { id: string }).id,
        categoryId: (otherCategory.body as { id: string }).id,
        amountInCents: 10,
        type: 'INCOME',
      })
      .expect(201);
    const secondOtherAccount = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Reserva da outra organização' })
      .expect(201);
    const otherTransfer = await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Idempotency-Key', transferKey)
      .send({
        fromAccountId: (otherAccount.body as { id: string }).id,
        toAccountId: (secondOtherAccount.body as { id: string }).id,
        amountInCents: 5,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', randomUUID())
      .send({
        ...transfer,
        toAccountId: (otherAccount.body as { id: string }).id,
        amountInCents: 50,
      })
      .expect(404);

    const role =
      (await appDatabase.query(`SELECT current_user AS name, rolsuper, rolbypassrls
      FROM pg_roles WHERE rolname = current_user`)) as Array<{
        name: string;
        rolsuper: boolean;
        rolbypassrls: boolean;
      }>;
    expect(role[0]).toMatchObject({
      name: 'fintrack_app',
      rolsuper: false,
      rolbypassrls: false,
    });
    const withoutContext = (await appDatabase.query(
      'SELECT id FROM accounts WHERE id = $1',
      [(otherAccount.body as { id: string }).id],
    )) as Array<{ id: string }>;
    expect(withoutContext).toHaveLength(0);
    await appDatabase.transaction(async (manager) => {
      await manager.query(
        "SELECT set_config('fintrack.organization_id', $1, true)",
        [organizationId],
      );
      const own = (await manager.query(
        'SELECT id FROM accounts WHERE id = $1',
        [fromAccountId],
      )) as Array<{ id: string }>;
      const foreign = (await manager.query(
        'SELECT id FROM accounts WHERE id = $1',
        [(otherAccount.body as { id: string }).id],
      )) as Array<{ id: string }>;
      expect(own).toHaveLength(1);
      expect(foreign).toHaveLength(0);
      const foreignRecords: Array<[string, string]> = [
        ['organizations', otherOrganizationId],
        ['users', (otherRegistration.body as { user: { id: string } }).user.id],
        ['accounts', (otherAccount.body as { id: string }).id],
        ['categories', (otherCategory.body as { id: string }).id],
        ['transactions', (otherTransaction.body as { id: string }).id],
        ['transfers', (otherTransfer.body as { id: string }).id],
      ];
      for (const [table, id] of foreignRecords) {
        const records = (await manager.query(
          `SELECT id FROM "${table}" WHERE id = $1`,
          [id],
        )) as Array<{ id: string }>;
        expect(records).toHaveLength(0);
      }
    });
    await expect(
      appDatabase.transaction(async (manager) => {
        await manager.query(
          "SELECT set_config('fintrack.organization_id', $1, true)",
          [organizationId],
        );
        await manager.query(
          `INSERT INTO accounts (id, organization_id, name, balance_in_cents, created_at)
        VALUES ($1, $2, 'Blocked', 0, now())`,
          [randomUUID(), otherOrganizationId],
        );
      }),
    ).rejects.toThrow();

    const loginStatuses: number[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          organizationId,
          email: `unknown-${attempt}@example.com`,
          password: 'incorrect',
        });
      loginStatuses.push(response.status);
    }
    expect(loginStatuses).toContain(429);
  });
});
