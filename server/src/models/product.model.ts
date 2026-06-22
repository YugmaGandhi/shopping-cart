import { Schema, model, type HydratedDocument } from 'mongoose';

/**
 * Explicit document interface (instead of `InferSchemaType`) for the same reason
 * as the User model: inference degrades fields to `unknown` once a schema uses a
 * `toJSON.transform` that deletes keys. See user.model.ts.
 */
export interface Product {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: Date;
}

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Supports case-insensitive name search and price sorting (Stage 1.5).
productSchema.index({ name: 1 });
productSchema.index({ price: 1 });

export type ProductDocument = HydratedDocument<Product>;

export const ProductModel = model<Product>('Product', productSchema);
