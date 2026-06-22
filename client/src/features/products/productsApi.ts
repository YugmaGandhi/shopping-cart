import { apiSlice } from '@/features/api/apiSlice';
import type { PaginationMeta } from '@/features/api/apiSlice';
import type { Product, ProductListArgs } from './types';

export interface ProductListResult {
  items: Product[];
  meta: PaginationMeta;
}

/** Drops undefined/empty args so they don't appear in the query string. */
function toParams(args: ProductListArgs): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (args.search) params.search = args.search;
  if (args.sort) params.sort = args.sort;
  if (args.minPrice !== undefined) params.minPrice = args.minPrice;
  if (args.maxPrice !== undefined) params.maxPrice = args.maxPrice;
  if (args.page) params.page = args.page;
  if (args.limit) params.limit = args.limit;
  return params;
}

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResult, ProductListArgs>({
      query: (args) => ({ url: '/products', params: toParams(args) }),
      // baseQuery forwards the envelope `meta` via the meta channel.
      transformResponse: (items: Product[], meta) => ({
        items,
        meta: (meta as { envelopeMeta?: PaginationMeta })?.envelopeMeta ?? {
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = productsApi;
