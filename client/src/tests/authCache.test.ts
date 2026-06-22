import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer, { setCredentials, logout } from '@/features/auth/authSlice';
import { authCacheMiddleware } from '@/app/authCacheMiddleware';
import { cartApi } from '@/features/cart/cartApi'; // ensures getCart endpoint is injected

function makeStore() {
  return configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer, auth: authReducer },
    middleware: (gDM) => gDM().concat(apiSlice.middleware, authCacheMiddleware),
  });
}

const seedCart = () => ({ id: 'c1', items: [], total: 0, itemCount: 0 });

describe('authCacheMiddleware (cart cannot leak across sessions)', () => {
  it('clears the RTK Query cache on logout', () => {
    const store = makeStore();
    store.dispatch(cartApi.util.upsertQueryData('getCart', undefined, seedCart()));
    expect(Object.keys(store.getState().api.queries).length).toBeGreaterThan(0);

    store.dispatch(logout());
    expect(Object.keys(store.getState().api.queries).length).toBe(0);
  });

  it('clears the RTK Query cache when a new user logs in', () => {
    const store = makeStore();
    store.dispatch(cartApi.util.upsertQueryData('getCart', undefined, seedCart()));
    expect(Object.keys(store.getState().api.queries).length).toBeGreaterThan(0);

    store.dispatch(
      setCredentials({
        token: 'new',
        user: { id: 'u2', name: 'New', email: 'n@x.com', role: 'user' },
      }),
    );
    expect(Object.keys(store.getState().api.queries).length).toBe(0);
  });
});
