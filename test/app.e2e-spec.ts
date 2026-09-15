import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { OrganizationRepository } from './../src/modules/organizations/domain/repositories/organization.repository.js';
import { InMemoryOrganizationRepository } from './../src/modules/organizations/infrastructure/repositories/in-memory-organization.repository.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationRepository)
      .useClass(InMemoryOrganizationRepository)
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

  afterEach(async () => {
    await app.close();
  });
});
