import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { NotFound } from '@/components/NotFound';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { ProductsPage } from '@/features/products/ProductsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { AdminPage } from '@/features/admin/AdminPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      // Auth-only area; AdminRoute nested inside adds the admin-role check.
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminRoute />,
            children: [{ path: 'admin', element: <AdminPage /> }],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
