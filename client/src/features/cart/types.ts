import type { Product } from '@/features/products/types';

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}
