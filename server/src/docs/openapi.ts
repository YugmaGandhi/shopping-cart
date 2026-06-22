import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
} from '../schemas/product.schema';
import { addItemSchema, updateQtySchema, cartItemParamSchema } from '../schemas/cart.schema';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ---------------------------------------------------------------------------
// Response data schemas (document the serialized shapes the API returns).
// ---------------------------------------------------------------------------
const UserSchema = registry.register(
  'User',
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['user', 'admin']),
    createdAt: z.string().datetime(),
  }),
);

const ProductSchema = registry.register(
  'Product',
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string().url(),
    stock: z.number().int(),
    createdAt: z.string().datetime(),
  }),
);

const CartItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int(),
  lineTotal: z.number(),
});

const CartSchema = registry.register(
  'Cart',
  z.object({
    id: z.string(),
    items: z.array(CartItemSchema),
    total: z.number(),
    itemCount: z.number().int(),
  }),
);

const AuthResultSchema = registry.register(
  'AuthResult',
  z.object({ token: z.string(), user: UserSchema }),
);

const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

// ---------------------------------------------------------------------------
// Standard envelope wrappers.
// ---------------------------------------------------------------------------
const success = <T extends z.ZodTypeAny>(data: T, withMeta = false) =>
  z.object({
    success: z.literal(true),
    data,
    ...(withMeta ? { meta: PaginationMetaSchema } : {}),
  });

const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.array(z.unknown()).optional(),
    }),
  }),
);

const jsonBody = <T extends z.ZodTypeAny>(schema: T) => ({
  content: { 'application/json': { schema } },
});
const ok = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  description,
  ...jsonBody(schema),
});
const err = (description: string) => ({ description, ...jsonBody(ErrorResponseSchema) });

const bearer = [{ bearerAuth: [] as string[] }];

// ---------------------------------------------------------------------------
// Auth paths
// ---------------------------------------------------------------------------
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: ['Auth'],
  summary: 'Register a new account',
  request: { body: jsonBody(registerSchema) },
  responses: {
    201: ok(success(AuthResultSchema), 'Account created'),
    400: err('Validation error'),
    409: err('Email already registered'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['Auth'],
  summary: 'Log in and receive a JWT',
  request: { body: jsonBody(loginSchema) },
  responses: {
    200: ok(success(AuthResultSchema), 'Authenticated'),
    400: err('Validation error'),
    401: err('Invalid credentials'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  tags: ['Auth'],
  summary: 'Get the current user',
  security: bearer,
  responses: {
    200: ok(success(UserSchema), 'Current user'),
    401: err('Unauthorized'),
  },
});

// ---------------------------------------------------------------------------
// Product paths
// ---------------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/v1/products',
  tags: ['Products'],
  summary: 'List products (search, sort, price filter, pagination)',
  request: { query: listProductsQuerySchema },
  responses: {
    200: ok(success(z.array(ProductSchema), true), 'Paginated product list'),
    400: err('Invalid query parameters'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/products/{id}',
  tags: ['Products'],
  summary: 'Get a product by id',
  request: { params: productIdParamSchema },
  responses: {
    200: ok(success(ProductSchema), 'Product'),
    404: err('Product not found'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/products',
  tags: ['Products'],
  summary: 'Create a product (admin)',
  security: bearer,
  request: { body: jsonBody(createProductSchema) },
  responses: {
    201: ok(success(ProductSchema), 'Created'),
    400: err('Validation error'),
    401: err('Unauthorized'),
    403: err('Forbidden (not an admin)'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/products/{id}',
  tags: ['Products'],
  summary: 'Update a product (admin)',
  security: bearer,
  request: { params: productIdParamSchema, body: jsonBody(updateProductSchema) },
  responses: {
    200: ok(success(ProductSchema), 'Updated'),
    400: err('Validation error'),
    401: err('Unauthorized'),
    403: err('Forbidden (not an admin)'),
    404: err('Product not found'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/products/{id}',
  tags: ['Products'],
  summary: 'Delete a product (admin)',
  security: bearer,
  request: { params: productIdParamSchema },
  responses: {
    204: { description: 'Deleted (no content)' },
    401: err('Unauthorized'),
    403: err('Forbidden (not an admin)'),
    404: err('Product not found'),
  },
});

// ---------------------------------------------------------------------------
// Cart paths (all require auth)
// ---------------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/v1/cart',
  tags: ['Cart'],
  summary: "Get the current user's cart",
  security: bearer,
  responses: {
    200: ok(success(CartSchema), 'Cart'),
    401: err('Unauthorized'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/cart/items',
  tags: ['Cart'],
  summary: 'Add an item (or increment quantity)',
  security: bearer,
  request: { body: jsonBody(addItemSchema) },
  responses: {
    200: ok(success(CartSchema), 'Updated cart'),
    400: err('Validation error or insufficient stock'),
    401: err('Unauthorized'),
    404: err('Product not found'),
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/cart/items/{productId}',
  tags: ['Cart'],
  summary: 'Set item quantity (<= 0 removes it)',
  security: bearer,
  request: { params: cartItemParamSchema, body: jsonBody(updateQtySchema) },
  responses: {
    200: ok(success(CartSchema), 'Updated cart'),
    400: err('Validation error or insufficient stock'),
    401: err('Unauthorized'),
    404: err('Item or product not found'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/cart/items/{productId}',
  tags: ['Cart'],
  summary: 'Remove an item from the cart',
  security: bearer,
  request: { params: cartItemParamSchema },
  responses: {
    200: ok(success(CartSchema), 'Updated cart'),
    401: err('Unauthorized'),
    404: err('Cart not found'),
  },
});

/** Builds the OpenAPI 3 document from the registered Zod schemas + paths. */
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Shopping Cart API',
      version: '1.0.0',
      description:
        'REST API for the shopping cart app. Every response uses the standard envelope ' +
        '({ success, data, meta? } or { success:false, error }).',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local development' }],
  });
}
