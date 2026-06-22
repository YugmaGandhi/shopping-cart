import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from '../../schemas/product.schema';
import { list, getOne, create, update, remove } from './product.controller';

const productsRouter = Router();

// Public reads.
productsRouter.get('/', validate({ query: listProductsQuerySchema }), list);
productsRouter.get('/:id', validate({ params: productIdParamSchema }), getOne);

// Admin-only writes.
productsRouter.post(
  '/',
  auth,
  requireRole('admin'),
  validate({ body: createProductSchema }),
  create,
);
productsRouter.patch(
  '/:id',
  auth,
  requireRole('admin'),
  validate({ params: productIdParamSchema, body: updateProductSchema }),
  update,
);
productsRouter.delete(
  '/:id',
  auth,
  requireRole('admin'),
  validate({ params: productIdParamSchema }),
  remove,
);

export default productsRouter;
