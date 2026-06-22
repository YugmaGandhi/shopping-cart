import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './db';

const app = createApp();

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const creds = { name: 'Ada', email: 'ada@x.com', password: 'password123' };

describe('Auth API', () => {
  it('registers a new user and returns a token (no password hash leaked)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toMatchObject({ email: 'ada@x.com', role: 'user' });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email registration with 409 CONFLICT', async () => {
    await request(app).post('/api/v1/auth/register').send(creds);
    const res = await request(app).post('/api/v1/auth/register').send(creds);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects invalid registration payloads with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('logs in with correct credentials and rejects wrong ones (401)', async () => {
    await request(app).post('/api/v1/auth/register').send(creds);

    const ok = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: creds.email, password: creds.password });
    expect(ok.status).toBe(200);
    const token = ok.body.data.token as string;

    const bad = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: creds.email, password: 'wrongpass' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('UNAUTHORIZED');

    // /me with the valid token returns the current user.
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(creds.email);
  });

  it('rejects /me without a token (401)', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
