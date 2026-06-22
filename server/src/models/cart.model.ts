import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

/**
 * Explicit document interfaces (instead of `InferSchemaType`) for the same
 * reason as the other models — inference degrades to `unknown` with our
 * `toJSON.transform`. See user.model.ts. The cart stores only productId +
 * quantity; price/name are populated from Product at read time.
 */
export interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface Cart {
  userId: Types.ObjectId;
  items: CartItem[];
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema<Cart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>)._id;
        return ret;
      },
    },
  },
);

export type CartDocument = HydratedDocument<Cart>;

export const CartModel = model<Cart>('Cart', cartSchema);
