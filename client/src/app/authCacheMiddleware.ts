import type { Middleware } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import { setCredentials, logout } from '@/features/auth/authSlice';

/**
 * Clears all RTK Query cache whenever the authenticated identity changes.
 * Without this, a cached cart/products list from a previous session would leak
 * into the next login (e.g. logging in as a different user shows the old cart).
 */
export const authCacheMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (setCredentials.match(action) || logout.match(action)) {
    store.dispatch(apiSlice.util.resetApiState());
  }
  return result;
};
