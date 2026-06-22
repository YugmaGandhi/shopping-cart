import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodError, type ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export interface RequestSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Validates (and coerces) the named parts of the request against Zod schemas.
 * Parsed values are written back onto `req` so downstream handlers get typed,
 * coerced data. A failure throws a VALIDATION_ERROR ApiError with field details.
 */
export function validate(schemas: RequestSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        // Express's req.query has only a getter; redefine it with the parsed value.
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', { value: parsedQuery, configurable: true });
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Validation failed', formatZodIssues(err)));
        return;
      }
      next(err);
    }
  };
}

export function formatZodIssues(err: ZodError) {
  return err.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

// Re-export z so schema modules have a single import source if desired.
export { z };
