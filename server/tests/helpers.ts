import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Express } from 'express';
import { UserModel, type UserRole } from '../src/models/user.model';
import { ProductModel } from '../src/models/product.model';

interface SeedUser {
  email: string;
  password: string;
  role?: UserRole;
}

/** Creates a user directly (bypassing the user-only register endpoint, so we can make admins). */
export async function createUser({ email, password, role = 'user' }: SeedUser) {
  const passwordHash = await bcrypt.hash(password, 8);
  return UserModel.create({ name: 'Test', email, passwordHash, role });
}

/** Creates a user and returns a valid Bearer token via the login endpoint. */
export async function tokenFor(app: Express, user: SeedUser): Promise<string> {
  await createUser(user);
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.data.token as string;
}

export async function createProduct(overrides: Record<string, unknown> = {}) {
  return ProductModel.create({
    name: 'Sample',
    description: 'A sample product',
    price: 10,
    imageUrl: 'https://example.com/img.png',
    stock: 100,
    ...overrides,
  });
}
