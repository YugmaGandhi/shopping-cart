import { ERROR_CODES, type ErrorCode } from '../constants/errorCodes';

/**
 * Application-level error carrying an HTTP status, a stable machine-readable `code`,
 * and optional `details`. The central error handler serializes thrown `ApiError`s
 * into the standard error envelope:
 *   { success: false, error: { code, message, details? } }
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, ERROR_CODES.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, ERROR_CODES.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, ERROR_CODES.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, ERROR_CODES.CONFLICT, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, ERROR_CODES.INTERNAL, message);
  }
}
