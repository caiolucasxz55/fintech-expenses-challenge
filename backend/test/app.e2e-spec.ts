import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('App (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let categoryId: string;
  let transactionId: string;

  const testUser = {
    name: 'E2E User',
    email: `e2e-${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/auth/register - registers a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('POST /api/auth/register - rejects duplicate email with 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
    });

    it('POST /api/auth/login - returns token on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      authToken = res.body.data.accessToken;
    });

    it('POST /api/auth/login - rejects wrong password with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('GET /api/categories - rejects unauthenticated request with 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/categories');
      expect(res.status).toBe(401);
    });
  });

  describe('Categories', () => {
    it('POST /api/categories - creates a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Food', description: 'Food expenses' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Food');
      categoryId = res.body.data.id;
    });

    it('GET /api/categories - lists only the user categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/categories/:id - returns the category', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(categoryId);
    });

    it('PUT /api/categories/:id - updates the category', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Food & Beverages' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Food & Beverages');
    });
  });

  describe('Transactions', () => {
    it('POST /api/transactions - creates a transaction', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Lunch',
          value: '35.50',
          type: 'expense',
          date: '2024-01-15',
          categoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.description).toBe('Lunch');
      expect(res.body.data.value).toBe('35.50');
      transactionId = res.body.data.id;
    });

    it('POST /api/transactions - rejects invalid payload with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Bad', value: '10.00' });

      expect(res.status).toBe(400);
    });

    it('GET /api/transactions - returns paginated list with meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.data).toBeInstanceOf(Array);
      expect(res.body.data.meta.total).toBeGreaterThan(0);
      expect(res.body.data.meta.page).toBe(1);
    });

    it('GET /api/transactions - filters by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.data.forEach((t: { type: string }) => {
        expect(t.type).toBe('expense');
      });
    });

    it('GET /api/transactions/:id - returns the transaction', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(transactionId);
    });

    it('PUT /api/transactions/:id - updates the transaction', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Team lunch' });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Team lunch');
    });

    it('DELETE /api/transactions/:id - soft deletes the transaction', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });

    it('GET /api/transactions/:id - returns 404 after soft delete', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Dashboard', () => {
    it('GET /api/dashboard - returns financial summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBeDefined();
      expect(res.body.data.totalIncome).toBeDefined();
      expect(res.body.data.totalExpense).toBeDefined();
      expect(res.body.data.topExpenseCategories).toBeInstanceOf(Array);
    });

    it('GET /api/dashboard - accepts period filters', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Categories cleanup', () => {
    it('DELETE /api/categories/:id - deletes the category', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });
  });
});
