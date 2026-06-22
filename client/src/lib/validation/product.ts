import { z } from 'zod';

/**
 * Client-side product validation, kept in shape with the server's product schema
 * (server/src/schemas/product.schema.ts). `coerce` turns the numeric <input>
 * string values into numbers on submit.
 */
export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  // Number inputs convert via valueAsNumber in the form, so these stay z.number()
  // (matching the server) and the form's input/output types align.
  price: z.number('Price must be a number').min(0, 'Price must be ≥ 0'),
  imageUrl: z.url('A valid image URL is required'),
  stock: z
    .number('Stock must be a number')
    .int('Stock must be an integer')
    .min(0, 'Stock must be ≥ 0'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
