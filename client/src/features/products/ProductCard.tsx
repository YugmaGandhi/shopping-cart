import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { useAddItemMutation } from '@/features/cart/cartApi';
import type { ApiErrorShape } from '@/features/api/apiSlice';
import type { Product } from './types';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [addItem, { isLoading }] = useAddItemMutation();
  const [imgError, setImgError] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      await addItem({ productId: product.id, quantity: 1 }).unwrap();
      toast.success(`Added “${product.name}” to cart`);
    } catch (err) {
      toast.error((err as ApiErrorShape)?.message ?? 'Could not add to cart');
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
      </div>

      <CardContent className="flex-1 space-y-1 p-4">
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
        <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
        <Button size="sm" onClick={handleAdd} disabled={isLoading || outOfStock}>
          <ShoppingCart className="h-4 w-4" />
          {isLoading ? 'Adding…' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  );
}
