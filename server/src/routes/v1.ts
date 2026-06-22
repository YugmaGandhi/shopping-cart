import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';

/**
 * Aggregates all versioned resource routers under /api/v1. Bumping to a future
 * /api/v2 means a new router file, leaving this one untouched.
 */
const v1Router = Router();

v1Router.use('/auth', authRouter);
// Mounted in later stages:
// v1Router.use('/products', productsRouter);
// v1Router.use('/cart', cartRouter);

export default v1Router;
