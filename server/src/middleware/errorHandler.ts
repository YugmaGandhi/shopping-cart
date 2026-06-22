import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES, type ErrorCode } from '../constants/errorCodes';
import { formatZodIssues } from './validate';
import { env } from '../config/env';

interface ErrorPayload {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

function toPayload(err: unknown): ErrorPayload {
  if (err instanceof ApiError) {
    return { status: err.statusCode, code: err.code, message: err.message, details: err.details };
  }

  if (err instanceof ZodError) {
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: formatZodIssues(err),
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    };
  }

  // Invalid ObjectId / cast failure.
  if (err instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid value for '${err.path}'`,
    };
  }

  // Duplicate key (unique index violation).
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return { status: 409, code: ERROR_CODES.CONFLICT, message: 'Resource already exists' };
  }

  // JWT errors (thrown by jsonwebtoken in the auth middleware path).
  if (
    err instanceof Error &&
    (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
  ) {
    return { status: 401, code: ERROR_CODES.UNAUTHORIZED, message: 'Invalid or expired token' };
  }

  return { status: 500, code: ERROR_CODES.INTERNAL, message: 'Internal server error' };
}

/**
 * Central error handler — the ONLY place that emits the error envelope:
 *   { success: false, error: { code, message, details? } }
 * Must be registered last, after all routes.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const { status, code, message, details } = toPayload(err);

  // Log server-side faults (and anything unexpected) for diagnosis.
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      // Surface stack only in development to aid debugging; never in production.
      ...(env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
