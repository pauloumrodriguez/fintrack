import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  afterEach(async () => {
    await app.close();
  });
});
