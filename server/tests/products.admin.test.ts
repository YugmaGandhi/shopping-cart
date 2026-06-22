import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './db';
import { tokenFor } from './helpers';

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const newProduct = {
  name: 'Gadget',
  description: 'A useful gadget',
  price: 19.99,
  imageUrl: 'https://example.com/g.png',
  stock: 5,
};

describe('Products admin authorization', () => {
  it('forbids non-admins from creating products (403 + envelope)', async () => {
    const token = await tokenFor(app, { email: 'user@x.com', password: 'password123' });
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects unauthenticated writes with 401', async () => {
    const res = await request(app).post('/api/v1/products').send(newProduct);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows admins to create products (201 + success envelope)', async () => {
    const token = await tokenFor(app, {
      email: 'admin@x.com',
      password: 'password123',
      role: 'admin',
    });
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: 'Gadget', price: 19.99 });
    expect(res.body.data.id).toBeDefined();
  });
});
