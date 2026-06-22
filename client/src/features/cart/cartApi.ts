import { apiSlice } from '@/features/api/apiSlice';
import type { Cart } from './types';

/** Single tag id for "the current user's cart". */
export const CART_TAG = { type: 'Cart' as const, id: 'CURRENT' };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Recompute derived totals after an optimistic mutation of the cached cart. */
function recompute(cart: Cart) {
  cart.total = round2(cart.items.reduce((sum, i) => sum + i.lineTotal, 0));
  cart.itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => '/cart',
      providesTags: [CART_TAG],
    }),

    addItem: builder.mutation<
      Cart,
      { productId: string; quantity?: number; _product?: Cart['items'][number]['product'] }
    >({
      query: ({ productId, quantity }) => ({
        url: '/cart/items',
        method: 'POST',
        body: { productId, quantity },
      }),
      async onQueryStarted({ productId, quantity = 1, _product }, { dispatch, queryFulfilled }) {
        if (!_product) return;
        const patch = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            const idx = draft.items.findIndex((i) => i.product.id === productId);
            if (idx !== -1) {
              draft.items[idx].quantity += quantity;
              draft.items[idx].lineTotal = round2(
                draft.items[idx].product.price * draft.items[idx].quantity,
              );
            } else {
              draft.items.push({
                product: _product,
                quantity,
                lineTotal: round2(_product.price * quantity),
              });
            }
            recompute(draft);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [CART_TAG],
    }),

    updateQty: builder.mutation<Cart, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      // Optimistically reflect the new quantity (or removal) before the server replies.
      async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            const idx = draft.items.findIndex((i) => i.product.id === productId);
            if (idx === -1) return;
            if (quantity <= 0) {
              draft.items.splice(idx, 1);
            } else {
              draft.items[idx].quantity = quantity;
              draft.items[idx].lineTotal = round2(draft.items[idx].product.price * quantity);
            }
            recompute(draft);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [CART_TAG],
    }),

    removeItem: builder.mutation<Cart, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            const idx = draft.items.findIndex((i) => i.product.id === productId);
            if (idx !== -1) draft.items.splice(idx, 1);
            recompute(draft);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [CART_TAG],
    }),
  }),
});

export const { useGetCartQuery, useAddItemMutation, useUpdateQtyMutation, useRemoveItemMutation } =
  cartApi;
