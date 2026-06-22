import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import type { ListProductsQuery } from '../../schemas/product.schema';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './product.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  // req.query has been validated + coerced by the `validate` middleware.
  const { items, meta } = await listProducts(req.query as unknown as ListProductsQuery);
  sendSuccess(res, items, 200, meta);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductById(req.params.id);
  sendSuccess(res, product, 200);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await createProduct(req.body);
  sendSuccess(res, product, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await updateProduct(req.params.id, req.body);
  sendSuccess(res, product, 200);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteProduct(req.params.id);
  res.status(204).send();
});
