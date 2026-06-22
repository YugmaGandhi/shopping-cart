import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './db';
import { tokenFor, createProduct } from './helpers';

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function setup() {
  const token = await tokenFor(app, { email: 'u@x.com', password: 'password123' });
  const product = await createProduct({ price: 25, stock: 10 });
  return { token, productId: product.id as string };
}

describe('Cart API', () => {
  it('adds an item and increments quantity on repeat', async () => {
    const { token, productId } = await setup();
    const auth = `Bearer ${token}`;

    const first = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId, quantity: 1 });
    expect(first.status).toBe(200);
    expect(first.body.data.items[0].quantity).toBe(1);

    const second = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', auth)
      .send({ productId, quantity: 2 });
    expect(second.body.data.items[0].quantity).toBe(3);
    // total derives from live price (25 * 3)
    expect(second.body.data.total).toBe(75);
  });

  it('updates quantity, computes totals, and removes on quantity <= 0', async () => {
    const { token, productId } = await setup();
    const auth = `Bearer ${token}`;
    await request(app).post('/api/v1/cart/items').set('Authorization', auth).send({ productId });

    const updated = await request(app)
      .patch(`/api/v1/cart/items/${productId}`)
      .set('Authorization', auth)
      .send({ quantity: 4 });
    expect(updated.body.data.items[0].quantity).toBe(4);
    expect(updated.body.data.total).toBe(100);

    const removed = await request(app)
      .patch(`/api/v1/cart/items/${productId}`)
      .set('Authorization', auth)
      .send({ quantity: 0 });
    expect(removed.body.data.items).toHaveLength(0);
    expect(removed.body.data.total).toBe(0);
  });

  it('rejects unauthenticated access with the error envelope', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
