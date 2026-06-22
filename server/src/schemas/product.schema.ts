import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  price: z.number().min(0, 'Price must be >= 0'),
  imageUrl: z.string().trim().url('A valid image URL is required'),
  stock: z.number().int('Stock must be an integer').min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().refine(isValidObjectId, 'Invalid product id'),
});

/** Public list query: search / sort / price range / pagination (all optional). */
export const listProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
