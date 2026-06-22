import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

const objectId = z.string().refine(isValidObjectId, 'Invalid product id');

export const addItemSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int('Quantity must be an integer').min(1).default(1),
});

export const updateQtySchema = z.object({
  // <= 0 is allowed and means "remove the item".
  quantity: z.coerce.number().int('Quantity must be an integer'),
});

export const cartItemParamSchema = z.object({
  productId: objectId,
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQtyInput = z.infer<typeof updateQtySchema>;
