import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let createdUuid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({
        sku: 'SKU-001',
        name: 'Test Product',
        category: 'Test Category',
        unitCost: 10.5,
        reorderPoint: 5,
      })
      .expect(201);
    expect(res.body).toHaveProperty('uuid');
    createdUuid = res.body.uuid;
    expect(res.body.sku).toBe('SKU-001');
  });

  it('/products (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/products/:uuid (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${createdUuid}`)
      .expect(200);
    expect(res.body.uuid).toBe(createdUuid);
  });

  it('/products/:uuid (PUT)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/products/${createdUuid}`)
      .send({ name: 'Updated Product' })
      .expect(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('/products/:uuid (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${createdUuid}`)
      .expect(204);
  });
});
