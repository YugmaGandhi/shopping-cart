import { ShoppingCart } from 'lucide-react';
import { useGetCartQuery } from './cartApi';
import { formatPrice } from '@/lib/currency';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/** Cart trigger (with item-count badge) + slide-over Sheet. Rendered for authed users. */
export function CartSidebar() {
  const { data: cart, isLoading, isError, refetch } = useGetCartQuery();
  const itemCount = cart?.itemCount ?? 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open cart"
          data-testid="cart-trigger"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Cart is empty'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isError ? (
            <ErrorBanner message="Couldn’t load your cart." onRetry={refetch} className="mt-4" />
          ) : isLoading ? (
            <div className="space-y-4 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8" />}
              title="Your cart is empty"
              description="Add products to see them here."
              className="mt-6"
            />
          ) : (
            <div className="divide-y">
              {cart.items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Checkout is out of scope for this assignment.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
