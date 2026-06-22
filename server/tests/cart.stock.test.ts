import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './db';
import { tokenFor, createProduct } from './helpers';

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function setup(stock: number) {
  const token = await tokenFor(app, { email: 'u@x.com', password: 'password123' });
  const product = await createProduct({ stock });
  return { auth: `Bearer ${token}`, productId: product.id as string };
}

describe('Cart stock enforcement', () => {
  it('rejects adding more than available stock (400)', async () => {
    const { auth, productId } = await setup(3);
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId, quantity: 4 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects incrementing past stock across multiple adds (400)', async () => {
    const { auth, productId } = await setup(3);
    const first = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId, quantity: 2 });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId, quantity: 2 }); // 2 + 2 = 4 > 3
    expect(second.status).toBe(400);
  });

  it('rejects updating quantity beyond stock (400)', async () => {
    const { auth, productId } = await setup(5);
    await request(app).post('/api/v1/cart/items').set('Authorization', auth).send({ productId });
    const res = await request(app)
      .patch(`/api/v1/cart/items/${productId}`)
      .set('Authorization', auth)
      .send({ quantity: 6 });
    expect(res.status).toBe(400);
  });

  it('returns 404 when adding a non-existent product', async () => {
    const { auth } = await setup(5);
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId: '64ad8f000000000000000000', quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
