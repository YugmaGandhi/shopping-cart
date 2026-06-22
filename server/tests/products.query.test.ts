import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './db';
import { createProduct } from './helpers';

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

async function seedCatalog() {
  await createProduct({ name: 'Red Keyboard', price: 50 });
  await createProduct({ name: 'Blue Keyboard', price: 150 });
  await createProduct({ name: 'Red Mouse', price: 20 });
  await createProduct({ name: 'Green Monitor', price: 300 });
  await createProduct({ name: 'Yellow Cable', price: 5 });
}

describe('Products list query', () => {
  it('filters by case-insensitive name search', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/products?search=keyboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('filters by price range', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/products?minPrice=10&maxPrice=100');
    const prices = res.body.data.map((p: { price: number }) => p.price);
    expect(prices.sort((a: number, b: number) => a - b)).toEqual([20, 50]);
  });

  it('sorts by price ascending', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/products?sort=price_asc');
    const prices = res.body.data.map((p: { price: number }) => p.price);
    expect(prices).toEqual([5, 20, 50, 150, 300]);
  });

  it('paginates with correct meta', async () => {
    await seedCatalog();
    const res = await request(app).get('/api/v1/products?page=2&limit=2');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });
});
