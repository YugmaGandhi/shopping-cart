import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { USER_ROLES, type UserRole } from '../models/user.model';

interface TokenPayload {
  sub: string;
  role: UserRole;
}

/** Verifies the Bearer token and attaches `req.user`. Throws 401 otherwise. */
export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  // jwt errors (invalid/expired) are mapped to 401 by the central error handler.
  const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

  if (!decoded.sub || !USER_ROLES.includes(decoded.role)) {
    throw ApiError.unauthorized('Invalid token payload');
  }

  req.user = { id: decoded.sub, role: decoded.role };
  next();
}
