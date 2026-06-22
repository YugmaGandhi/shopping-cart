import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import type { UserRole } from '../models/user.model';

/**
 * Guards a route by role. Must run AFTER `auth` (which sets req.user).
 * Returns 403 when the authenticated user lacks the required role.
 */
export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (req.user.role !== role) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  };
}
