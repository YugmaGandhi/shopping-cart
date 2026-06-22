import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { UserModel, type UserDocument } from '../../models/user.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput } from '../../schemas/auth.schema';

const SALT_ROUNDS = 10;

function signToken(user: UserDocument): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

function toAuthResult(user: UserDocument) {
  return { token: signToken(user), user: user.toJSON() };
}

export async function registerUser(input: RegisterInput) {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return toAuthResult(user);
}

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return toAuthResult(user);
}

export async function getUserById(id: string) {
  const user = await UserModel.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toJSON();
}
