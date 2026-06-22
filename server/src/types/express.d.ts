import type { UserRole } from '../models/user.model';

/** The authenticated principal attached to req by the `auth` middleware. */
export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
