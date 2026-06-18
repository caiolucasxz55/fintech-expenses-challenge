import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { applySecurityMiddleware } from '../src/common/security.config';
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

  const secondUser = {
    name: 'Second User',
    email: `e2e-second-${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    applySecurityMiddleware(app);
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

  describe('Security', () => {
    describe('Security headers (Helmet)', () => {
      it('response includes X-Content-Type-Options: nosniff', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });

      it('response includes X-Frame-Options to prevent clickjacking', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.headers['x-frame-options']).toBeDefined();
      });

      it('response includes Strict-Transport-Security (HSTS)', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.headers['strict-transport-security']).toContain('max-age=');
      });

      it('response includes X-DNS-Prefetch-Control', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.headers['x-dns-prefetch-control']).toBeDefined();
      });
    });

    describe('Authentication guard', () => {
      const protectedRoutes = [
        { method: 'get', path: '/api/categories' },
        { method: 'get', path: '/api/transactions' },
        { method: 'get', path: '/api/dashboard' },
      ];

      protectedRoutes.forEach(({ method, path }) => {
        it(`${method.toUpperCase()} ${path} - rejects request without token (401)`, async () => {
          const res = await (request(app.getHttpServer()) as any)[method](path);
          expect(res.status).toBe(401);
        });
      });

      it('rejects request with malformed token (401)', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', 'Bearer not.a.valid.jwt');

        expect(res.status).toBe(401);
      });

      it('rejects request with tampered JWT signature (401)', async () => {
        const [header, payload] = authToken.split('.');
        const tamperedToken = `${header}.${payload}.invalidsignature`;

        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${tamperedToken}`);

        expect(res.status).toBe(401);
      });

      it('rejects request with token in wrong format (401)', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', authToken);

        expect(res.status).toBe(401);
      });
    });

    describe('Input validation', () => {
      it('rejects unknown fields (forbidNonWhitelisted) with 400', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/categories')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: 'Valid', unknownField: 'hacker' });

        expect(res.status).toBe(400);
      });

      it('rejects invalid transaction type enum with 400', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: 'Test',
            value: '10.00',
            type: 'invalid_type',
            date: '2024-01-15',
            categoryId,
          });

        expect(res.status).toBe(400);
      });

      it('não quebra com payload XSS na descrição (sanitização é responsabilidade do frontend)', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: '<script>alert("xss")</script>',
            value: '10.00',
            type: 'expense',
            date: '2024-01-15',
            categoryId,
          });

        expect([201, 400]).toContain(res.status);
      });

      it('rejects negative page number with 400', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/transactions?page=-1')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(400);
      });

      it('rejects missing required fields on transaction creation with 400', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ description: 'Incomplete' });

        expect(res.status).toBe(400);
      });

      it('rejects short password on register with 400', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'test@test.com', password: '123' });

        expect(res.status).toBe(400);
      });

      it('rejects invalid email format on register with 400', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'not-an-email', password: 'password123' });

        expect(res.status).toBe(400);
      });
    });

    describe('Cross-user isolation', () => {
      let secondToken: string;
      let secondCategoryId: string;

      beforeAll(async () => {
        const reg = await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(secondUser);
        secondToken = reg.body.data.accessToken;

        const cat = await request(app.getHttpServer())
          .post('/api/categories')
          .set('Authorization', `Bearer ${secondToken}`)
          .send({ name: 'Second User Category' });
        secondCategoryId = cat.body.data.id;
      });

      it('user A cannot read user B category (404)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/api/categories/${secondCategoryId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
      });

      it('user A cannot update user B category (404)', async () => {
        const res = await request(app.getHttpServer())
          .put(`/api/categories/${secondCategoryId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: 'Hijacked' });

        expect(res.status).toBe(404);
      });

      it('user A cannot delete user B category (404)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/api/categories/${secondCategoryId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
      });

      it('user A list does not contain user B categories', async () => {
        const res = await request(app.getHttpServer())
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);

        const ids = res.body.data.map((c: { id: string }) => c.id);
        expect(ids).not.toContain(secondCategoryId);
      });

      it('user A cannot read user B transaction (403)', async () => {
        const tx = await request(app.getHttpServer())
          .post('/api/transactions')
          .set('Authorization', `Bearer ${secondToken}`)
          .send({
            description: 'Private tx',
            value: '99.00',
            type: 'income',
            date: '2024-06-01',
            categoryId: secondCategoryId,
          });

        const res = await request(app.getHttpServer())
          .get(`/api/transactions/${tx.body.data.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(403);
      });
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
