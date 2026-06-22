import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { toast } from '@/components/ui/sonner';
import { TOKEN_KEY, type ApiErrorShape } from '@/features/api/apiSlice';

/**
 * Centralized handling of cross-cutting RTK Query failures so features don't
 * each reimplement it:
 *  - 401 while a token exists → session expired: clear token + redirect to /login.
 *    (A 401 with no token is an ordinary login failure — left to the form.)
 *  - network error / 5xx → toast (transient/server problems).
 * Per-field validation (400) and not-found (404) stay with the feature UI.
 */
export const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as ApiErrorShape | undefined;
    const status = error?.status;

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      toast.error('Your session expired. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    } else if (status === 'FETCH_ERROR' || (typeof status === 'number' && status >= 500)) {
      toast.error(error?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return next(action);
};
