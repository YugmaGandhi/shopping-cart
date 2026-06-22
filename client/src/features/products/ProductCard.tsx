import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useAddItemMutation, useGetCartQuery, useUpdateQtyMutation } from '@/features/cart/cartApi';
import type { ApiErrorShape } from '@/features/api/apiSlice';
import type { Product } from './types';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuantityStepper } from '@/components/QuantityStepper';
import { toast } from '@/components/ui/sonner';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [addItem, { isLoading: isAdding }] = useAddItemMutation();
  const [updateQty, { isLoading: isUpdating }] = useUpdateQtyMutation();
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [imgError, setImgError] = useState(false);

  const outOfStock = product.stock <= 0;
  const cartQty = cart?.items.find((i) => i.product.id === product.id)?.quantity ?? 0;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1, _product: product }).unwrap();
      toast.success(`Added “${product.name}” to cart`);
    } catch (err) {
      toast.error((err as ApiErrorShape)?.message ?? 'Could not add to cart');
    }
  };

  // updateQty treats a quantity of 0 as "remove", so a single handler covers both.
  const changeQty = async (next: number) => {
    try {
      await updateQty({ productId: product.id, quantity: next }).unwrap();
    } catch (err) {
      toast.error((err as ApiErrorShape)?.message ?? 'Could not update cart');
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {imgError ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        )}
        {outOfStock && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Out of stock
          </Badge>
        )}
        {cartQty > 0 && <Badge className="absolute right-2 top-2">{cartQty} in cart</Badge>}
      </div>

      <CardContent className="flex-1 space-y-1 p-4">
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
        <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
        {cartQty > 0 ? (
          <QuantityStepper quantity={cartQty} onChange={changeQty} disabled={isUpdating} />
        ) : (
          <Button size="sm" onClick={handleAdd} disabled={isAdding || outOfStock}>
            <ShoppingCart className="h-4 w-4" />
            {isAdding ? 'Adding…' : 'Add'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
