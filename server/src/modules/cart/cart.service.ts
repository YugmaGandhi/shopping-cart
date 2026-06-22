import { CartModel, type CartDocument } from '../../models/cart.model';
import { ProductModel, type ProductDocument } from '../../models/product.model';
import { ApiError } from '../../utils/ApiError';

/** Rounds to 2 decimals to avoid floating-point money drift. */
const round2 = (n: number) => Math.round(n * 100) / 100;

/** A populated cart item still has its `productId` field as a Product document. */
function isPopulatedProduct(value: unknown): value is ProductDocument {
  return typeof value === 'object' && value !== null && 'price' in value;
}

/**
 * Serializes a cart whose items have been populated with their products.
 * Computes line totals + grand total from LIVE product prices (the cart never
 * stores price). Items whose product was deleted are skipped.
 */
function serializeCart(cart: CartDocument) {
  const items = [];
  let total = 0;

  for (const item of cart.items) {
    const product = item.productId as unknown;
    if (!isPopulatedProduct(product)) continue; // product removed since added

    const lineTotal = round2(product.price * item.quantity);
    total += lineTotal;
    items.push({ product: product.toJSON(), quantity: item.quantity, lineTotal });
  }

  return {
    id: cart.id as string,
    items,
    total: round2(total),
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
  };
}

/** Finds the user's cart (creating an empty one if needed) and populates products. */
async function getOrCreatePopulatedCart(userId: string): Promise<CartDocument> {
  const cart =
    (await CartModel.findOne({ userId })) ?? (await CartModel.create({ userId, items: [] }));
  await cart.populate('items.productId');
  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreatePopulatedCart(userId);
  return serializeCart(cart);
}

export async function addItem(userId: string, productId: string, quantity: number) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const cart =
    (await CartModel.findOne({ userId })) ?? (await CartModel.create({ userId, items: [] }));

  const existing = cart.items.find((i) => i.productId.toString() === productId);
  const nextQty = (existing?.quantity ?? 0) + quantity;

  if (nextQty > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} in stock`);
  }

  if (existing) {
    existing.quantity = nextQty;
  } else {
    cart.items.push({ productId: product._id, quantity });
  }

  await cart.save();
  await cart.populate('items.productId');
  return serializeCart(cart);
}

export async function updateItemQuantity(userId: string, productId: string, quantity: number) {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) {
    throw ApiError.notFound('Item not in cart');
  }

  if (quantity <= 0) {
    // Setting quantity to zero (or below) removes the item.
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  } else {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    if (quantity > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} in stock`);
    }
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.productId');
  return serializeCart(cart);
}

export async function removeItem(userId: string, productId: string) {
  const cart = await CartModel.findOne({ userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

  await cart.save();
  await cart.populate('items.productId');
  return serializeCart(cart);
}
