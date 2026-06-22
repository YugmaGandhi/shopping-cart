import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const API_ROOT = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

/** Token storage key — shared with the auth slice (Stage 2.5). */
export const TOKEN_KEY = 'sc_token';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** The normalized error shape components/middleware can rely on. */
export interface ApiErrorShape {
  status: number | string;
  code?: string;
  message: string;
  details?: unknown;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_ROOT}/api/v1`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Wraps fetchBaseQuery to speak our response envelope:
 *  - success: unwraps `{ success, data, meta }` so endpoints receive `data`
 *    directly; pagination `meta` is forwarded via the baseQuery meta channel
 *    (read it in an endpoint's `transformResponse`).
 *  - error: normalizes `{ success:false, error:{ code, message, details } }`
 *    into a flat { status, code, message, details } shape.
 */
export const baseQueryWithEnvelope: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiErrorShape
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const { status, data } = result.error as FetchBaseQueryError & { data?: unknown };
    const envelope = data as { error?: { code?: string; message?: string; details?: unknown } };
    return {
      error: {
        status,
        code: envelope?.error?.code,
        message: envelope?.error?.message ?? 'Something went wrong',
        details: envelope?.error?.details,
      },
    };
  }

  const body = result.data as { data?: unknown; meta?: PaginationMeta } | undefined;
  return {
    data: body?.data,
    meta: { ...result.meta, envelopeMeta: body?.meta },
  };
};

/**
 * Base API. Feature slices extend it via `apiSlice.injectEndpoints(...)`,
 * keeping endpoint definitions colocated with their features.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithEnvelope,
  tagTypes: ['Product', 'Cart', 'Auth'],
  endpoints: () => ({}),
});
