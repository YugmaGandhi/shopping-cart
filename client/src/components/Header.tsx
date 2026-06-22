import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { CartSidebar } from '@/features/cart/CartSidebar';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  logout,
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
} from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * App header: brand, cart trigger (the Sheet itself is wired in Stage 2.7),
 * and an auth-aware user menu.
 */
export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Shopping Cart
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && <CartSidebar />}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-[10rem] truncate">{user?.name ?? 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
