import { Minus, Plus, Trash2, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useUpdateQtyMutation, useRemoveItemMutation } from './cartApi';
import type { CartItem as CartItemType } from './types';
import type { ApiErrorShape } from '@/features/api/apiSlice';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

export function CartItem({ item }: { item: CartItemType }) {
  const [updateQty, { isLoading: updating }] = useUpdateQtyMutation();
  const [removeItem, { isLoading: removing }] = useRemoveItemMutation();
  const [imgError, setImgError] = useState(false);
  const pending = updating || removing;
  const { product, quantity, lineTotal } = item;

  const changeQty = async (next: number) => {
    try {
      await updateQty({ productId: product.id, quantity: next }).unwrap();
    } catch (err) {
      toast.error((err as ApiErrorShape)?.message ?? 'Could not update quantity');
    }
  };

  const remove = async () => {
    try {
      await removeItem(product.id).unwrap();
    } catch (err) {
      toast.error((err as ApiErrorShape)?.message ?? 'Could not remove item');
    }
  };

  return (
    <div className="flex gap-3 py-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {imgError ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-2">
          <span className="line-clamp-1 text-sm font-medium">{product.name}</span>
          <span className="text-sm font-semibold">${lineTotal.toFixed(2)}</span>
        </div>
        <span className="text-xs text-muted-foreground">${product.price.toFixed(2)} each</span>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              aria-label="Decrease quantity"
              disabled={pending}
              onClick={() => changeQty(quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              aria-label="Increase quantity"
              disabled={pending}
              onClick={() => changeQty(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
            disabled={pending}
            onClick={remove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
