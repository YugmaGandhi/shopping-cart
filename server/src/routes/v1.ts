import { Router } from 'express';

/**
 * Aggregates all versioned resource routers under /api/v1. Module routers
 * (auth, products, cart) are mounted here in Stages 1.4–1.6. Bumping to a future
 * /api/v2 means a new router file, leaving this one untouched.
 */
const v1Router = Router();

// Mounted in later stages:
// v1Router.use('/auth', authRouter);
// v1Router.use('/products', productsRouter);
// v1Router.use('/cart', cartRouter);

export default v1Router;
