import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  afterEach(async () => {
    await app.close();
  });
});
