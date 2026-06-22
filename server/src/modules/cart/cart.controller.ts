import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import * as cartService from './cart.service';

export const get = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  sendSuccess(res, cart, 200);
});

export const add = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user!.id, productId, quantity);
  sendSuccess(res, cart, 200);
});

export const updateQty = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItemQuantity(
    req.user!.id,
    req.params.productId,
    req.body.quantity,
  );
  sendSuccess(res, cart, 200);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(req.user!.id, req.params.productId);
  sendSuccess(res, cart, 200);
});
