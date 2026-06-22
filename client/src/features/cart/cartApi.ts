import { apiSlice } from '@/features/api/apiSlice';
import type { Cart } from './types';

/** Single tag id for "the current user's cart". */
export const CART_TAG = { type: 'Cart' as const, id: 'CURRENT' };

/**
 * Cart endpoints. `addItem` lands here in Stage 2.6 (so product cards can add);
 * Stage 2.7 adds getCart / updateQty / removeItem + the sidebar UI.
 */
export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addItem: builder.mutation<Cart, { productId: string; quantity?: number }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: [CART_TAG],
    }),
  }),
});

export const { useAddItemMutation } = cartApi;
