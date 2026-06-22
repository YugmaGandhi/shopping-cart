import { apiSlice } from '@/features/api/apiSlice';
import type { Product } from '@/features/products/types';
import type { ProductFormValues } from '@/lib/validation/product';

const LIST_TAG = { type: 'Product' as const, id: 'LIST' };

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation<Product, ProductFormValues>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [LIST_TAG],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: ProductFormValues }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, LIST_TAG],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Product', id }, LIST_TAG],
    }),
  }),
});

export const { useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } =
  adminApi;
