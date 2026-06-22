import type { ReactElement, ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer, { setCredentials } from '@/features/auth/authSlice';

function makeStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authReducer,
    },
    middleware: (gDM) => gDM().concat(apiSlice.middleware),
  });
}

/** Render a component inside a fresh Redux store + router. Pass `authed`/`admin` to sign in. */
export function renderWithProviders(
  ui: ReactElement,
  options: { authed?: boolean; admin?: boolean } = {},
) {
  const store = makeStore();
  if (options.authed || options.admin) {
    store.dispatch(
      setCredentials({
        token: 'test-token',
        user: {
          id: 'u1',
          name: 'Tester',
          email: 't@x.com',
          role: options.admin ? 'admin' : 'user',
        },
      }),
    );
  }
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
