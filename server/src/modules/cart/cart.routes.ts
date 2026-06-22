import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addItemSchema, updateQtySchema, cartItemParamSchema } from '../../schemas/cart.schema';
import { get, add, updateQty, remove } from './cart.controller';

const cartRouter = Router();

// Every cart route requires authentication — a cart belongs to a user.
cartRouter.use(auth);

cartRouter.get('/', get);
cartRouter.post('/items', validate({ body: addItemSchema }), add);
cartRouter.patch(
  '/items/:productId',
  validate({ params: cartItemParamSchema, body: updateQtySchema }),
  updateQty,
);
cartRouter.delete('/items/:productId', validate({ params: cartItemParamSchema }), remove);

export default cartRouter;
