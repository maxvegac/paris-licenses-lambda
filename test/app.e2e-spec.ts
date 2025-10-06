import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Configurar variables de entorno para testing
    process.env.FACTO_TEST_MODE = 'true';
    process.env.PARIS_API_EMAIL = 'test@example.com';
    process.env.PARIS_API_PASSWORD = 'test_password';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASSWORD = 'test_password';
    process.env.INVOICES_BUCKET = 'test-invoices-bucket';
    process.env.INVOICES_TABLE_NAME = 'test-invoices-table';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer() as Parameters<typeof request>[0])
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/);
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer() as Parameters<typeof request>[0])
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'OK');
        expect(res.body).toHaveProperty('timestamp');
      });
  });
});
