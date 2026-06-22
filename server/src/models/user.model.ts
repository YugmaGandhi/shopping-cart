import { Schema, model, type HydratedDocument } from 'mongoose';

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Explicit document interface (instead of Mongoose's `InferSchemaType`).
 * Inference silently degrades every field to `unknown` once the schema defines a
 * `toJSON.transform` that deletes keys — which we need here to hide passwordHash.
 * An explicit interface keeps field types reliable and reusable, and is
 * Mongoose's own recommendation for non-trivial schemas.
 */
export interface User {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: USER_ROLES, default: 'user' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        // Never expose the password hash or the raw _id to clients.
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>)._id;
        return ret;
      },
    },
  },
);

export type UserDocument = HydratedDocument<User>;

export const UserModel = model<User>('User', userSchema);
