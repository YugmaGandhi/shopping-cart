import { Schema, model, type InferSchemaType, type HydratedDocument, type Types } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema(
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

export type CartItem = InferSchemaType<typeof cartItemSchema>;
export type Cart = InferSchemaType<typeof cartSchema>;
export type CartDocument = HydratedDocument<Cart>;
export type CartItemInput = { productId: Types.ObjectId; quantity: number };

export const CartModel = model('Cart', cartSchema);
