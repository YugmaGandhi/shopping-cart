import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { toast } from '@/components/ui/sonner';
import { type ApiErrorShape } from '@/features/api/apiSlice';
import { logout, selectIsAuthenticated } from '@/features/auth/authSlice';
import type { RootState } from './store';

/**
 * Centralized handling of cross-cutting RTK Query failures so features don't
 * each reimplement it:
 *  - 401 while logged in → session expired: dispatch logout. Route guards then
 *    redirect to /login (soft SPA transition, no full reload). A 401 with no
 *    session is an ordinary login failure — left to the form.
 *  - network error / 5xx → toast (transient/server problems).
 * Per-field validation (400) and not-found (404) stay with the feature UI.
 */
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as ApiErrorShape | undefined;
    const status = error?.status;
    const isAuthed = selectIsAuthenticated(store.getState() as RootState);

    if (status === 401 && isAuthed) {
      store.dispatch(logout());
      toast.error('Your session expired. Please log in again.');
    } else if (status === 'FETCH_ERROR' || (typeof status === 'number' && status >= 500)) {
      toast.error(error?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return next(action);
};
