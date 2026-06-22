import type { Response } from 'express';

export interface SuccessMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

/**
 * Emits the standard success envelope: { success: true, data, meta? }.
 * Every controller uses this — no route hand-rolls its own JSON shape.
 */
export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: SuccessMeta): void {
  res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}
