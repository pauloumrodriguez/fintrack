import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { OrganizationRepository } from './../src/modules/organizations/domain/repositories/organization.repository.js';
import { InMemoryOrganizationRepository } from './../src/modules/organizations/infrastructure/repositories/in-memory-organization.repository.js';
import { UserRepository } from './../src/modules/users/domain/repositories/user.repository.js';
import { InMemoryUserRepository } from './../src/modules/users/infrastructure/repositories/in-memory-user.repository.js';
import { AccountRepository } from './../src/modules/accounts/domain/repositories/account.repository.js';
import { InMemoryAccountRepository } from './../src/modules/accounts/infrastructure/repositories/in-memory-account.repository.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationRepository)
      .useClass(InMemoryOrganizationRepository)
      .overrideProvider(UserRepository)
      .useClass(InMemoryUserRepository)
      .overrideProvider(AccountRepository)
      .useClass(InMemoryAccountRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();
  });

  it('GET /health responde com HTTP 200 e o estado da API', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ status: 'ok', service: 'fintrack-api' });
  });

  it('POST /organizations cria uma organização', async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);

    const body = response.body as {
      id: string;
      name: string;
      createdAt: string;
    };

    expect(body.id).toBeTruthy();
    expect(body.name).toBe('Padaria do Paulo');
    expect(body.createdAt).toBeTruthy();
  });

  it('POST /organizations rejeita nome vazio', () => {
    return request(app.getHttpServer())
      .post('/organizations')
      .send({ name: '   ' })
      .expect(400);
  });

  it('GET /organizations lista as organizações criadas', async () => {
    await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/organizations')
      .expect(200);

    const body = response.body as Array<{
      id: string;
      name: string;
      createdAt: string;
    }>;

    expect(body).toHaveLength(1);
    expect(body[0]?.name).toBe('Padaria do Paulo');
  });

  it('GET /organizations/:id encontra uma organização', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);
    const createdOrganization = createResponse.body as {
      id: string;
      name: string;
      createdAt: string;
    };

    const response = await request(app.getHttpServer())
      .get(`/organizations/${createdOrganization.id}`)
      .expect(200);

    expect(response.body).toEqual(createdOrganization);
  });

  it('GET /organizations/:id retorna 404 para organização inexistente', () => {
    return request(app.getHttpServer())
      .get('/organizations/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });

  it('GET /organizations/:id rejeita um id que não é UUID', () => {
    return request(app.getHttpServer())
      .get('/organizations/id-invalido')
      .expect(400);
  });

  it('POST /organizations retorna 409 para nome duplicado', async () => {
    await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: '  PADARIA DO PAULO  ' })
      .expect(409);
  });

  it('POST /organizations rejeita propriedades não declaradas', () => {
    return request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo', admin: true })
      .expect(400);
  });

  it('POST /organizations rejeita nome com mais de 100 caracteres', () => {
    return request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'a'.repeat(101) })
      .expect(400);
  });

  it('POST /users cria um usuário sem expor a senha', async () => {
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);
    const organization = organizationResponse.body as { id: string };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        organizationId: organization.id,
        name: 'Paulo',
        email: 'paulo@example.com',
        password: 'senha-segura',
        role: 'ADMIN',
      })
      .expect(201);

    const body = response.body as Record<string, unknown>;
    expect(body.email).toBe('paulo@example.com');
    expect(body.role).toBe('ADMIN');
    expect(body.password).toBeUndefined();
    expect(body.passwordHash).toBeUndefined();
  });

  it('POST /users rejeita senha com menos de 8 caracteres', async () => {
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);
    const organization = organizationResponse.body as { id: string };

    return request(app.getHttpServer())
      .post('/users')
      .send({
        organizationId: organization.id,
        name: 'Paulo',
        email: 'paulo@example.com',
        password: 'curta',
        role: 'ADMIN',
      })
      .expect(400);
  });

  it('POST /users rejeita uma organização inexistente', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        organizationId: '00000000-0000-4000-8000-000000000000',
        name: 'Paulo',
        email: 'paulo@example.com',
        password: 'senha-segura',
        role: 'ADMIN',
      })
      .expect(404);
  });

  it('POST /users rejeita e-mail duplicado', async () => {
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);
    const organization = organizationResponse.body as { id: string };
    const input = {
      organizationId: organization.id,
      name: 'Paulo',
      email: 'paulo@example.com',
      password: 'senha-segura',
      role: 'ADMIN',
    };

    await request(app.getHttpServer()).post('/users').send(input).expect(201);
    await request(app.getHttpServer())
      .post('/users')
      .send({ ...input, email: 'PAULO@EXAMPLE.COM' })
      .expect(409);
  });

  it('GET /organizations/:id/users lista os usuários da organização', async () => {
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria do Paulo' })
      .expect(201);
    const organization = organizationResponse.body as { id: string };

    await request(app.getHttpServer())
      .post('/users')
      .send({
        organizationId: organization.id,
        name: 'Paulo',
        email: 'paulo@example.com',
        password: 'senha-segura',
        role: 'ADMIN',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/users`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].email).toBe('paulo@example.com');
    expect(response.body[0].passwordHash).toBeUndefined();
  });

  it('POST /accounts cria conta com saldo zero', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria' })
      .expect(201);
    const organizationId = (organization.body as { id: string }).id;

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId, name: '  Caixa  ' })
      .expect(201);
    const body = response.body as {
      id: string;
      organizationId: string;
      name: string;
      balanceInCents: number;
      createdAt: string;
    };

    expect(body.id).toBeTruthy();
    expect(body.organizationId).toBe(organizationId);
    expect(body.name).toBe('Caixa');
    expect(body.balanceInCents).toBe(0);
    expect(body.createdAt).toBeTruthy();
  });

  it('POST /accounts rejeita organização inexistente', () => {
    return request(app.getHttpServer())
      .post('/accounts')
      .send({
        organizationId: '00000000-0000-4000-8000-000000000000',
        name: 'Caixa',
      })
      .expect(404);
  });

  it('POST /accounts rejeita nome vazio e campos extras', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria' })
      .expect(201);
    const organizationId = (organization.body as { id: string }).id;

    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId, name: '   ' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId, name: 'Caixa', balanceInCents: 1000 })
      .expect(400);
  });

  it('POST /accounts rejeita nome duplicado na mesma organização', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria' })
      .expect(201);
    const organizationId = (organization.body as { id: string }).id;

    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId, name: 'Caixa' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId, name: ' CAIXA ' })
      .expect(409);
  });

  it('GET /organizations/:id/accounts lista somente contas dessa organização', async () => {
    const firstOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria' })
      .expect(201);
    const secondOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Mercado' })
      .expect(201);
    const firstId = (firstOrganization.body as { id: string }).id;
    const secondId = (secondOrganization.body as { id: string }).id;

    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId: firstId, name: 'Caixa' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId: secondId, name: 'Caixa' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${firstId}/accounts`)
      .expect(200);
    const body = response.body as Array<{
      id: string;
      organizationId: string;
    }>;
    expect(body).toHaveLength(1);
    expect(body[0]?.organizationId).toBe(firstId);
  });

  it('GET /organizations/:id/accounts/:accountId exige a organização correta', async () => {
    const firstOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Padaria' })
      .expect(201);
    const secondOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: 'Mercado' })
      .expect(201);
    const firstId = (firstOrganization.body as { id: string }).id;
    const secondId = (secondOrganization.body as { id: string }).id;
    const account = await request(app.getHttpServer())
      .post('/accounts')
      .send({ organizationId: firstId, name: 'Caixa' })
      .expect(201);
    const accountId = (account.body as { id: string }).id;

    await request(app.getHttpServer())
      .get(`/organizations/${firstId}/accounts/${accountId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/organizations/${secondId}/accounts/${accountId}`)
      .expect(404);
  });

  it('GET /organizations/:id/accounts/:accountId rejeita UUID inválido', () => {
    return request(app.getHttpServer())
      .get('/organizations/id-invalido/accounts/conta-invalida')
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
