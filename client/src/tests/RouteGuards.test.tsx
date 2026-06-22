import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer, { setCredentials } from '@/features/auth/authSlice';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';

function makeStore(role?: 'user' | 'admin') {
  const store = configureStore({
    reducer: { [apiSlice.reducerPath]: apiSlice.reducer, auth: authReducer },
    middleware: (gDM) => gDM().concat(apiSlice.middleware),
  });
  if (role) {
    store.dispatch(
      setCredentials({ token: 't', user: { id: 'u1', name: 'T', email: 't@x.com', role } }),
    );
  }
  return store;
}

function renderAt(path: string, role?: 'user' | 'admin') {
  return render(
    <Provider store={makeStore(role)}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
          <Route path="/" element={<div>PRODUCTS PAGE</div>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>ADMIN PAGE</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('Route guards', () => {
  it('redirects unauthenticated users away from /admin to /login', () => {
    renderAt('/admin');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN PAGE')).not.toBeInTheDocument();
  });

  it('redirects authenticated non-admins away from /admin to /', () => {
    renderAt('/admin', 'user');
    expect(screen.getByText('PRODUCTS PAGE')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN PAGE')).not.toBeInTheDocument();
  });

  it('allows admins to reach /admin', () => {
    renderAt('/admin', 'admin');
    expect(screen.getByText('ADMIN PAGE')).toBeInTheDocument();
  });
});
