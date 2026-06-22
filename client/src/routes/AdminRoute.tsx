import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAdmin } from '@/features/auth/authSlice';

/**
 * Role guard for admin-only routes. Nested inside ProtectedRoute, so auth is
 * already guaranteed; this only checks the admin role and bounces others home.
 */
export function AdminRoute() {
  const isAdmin = useAppSelector(selectIsAdmin);
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
