import type { FilterQuery, SortOrder } from 'mongoose';
import { ProductModel, type Product } from '../../models/product.model';
import { ApiError } from '../../utils/ApiError';
import type {
  CreateProductInput,
  UpdateProductInput,
  ListProductsQuery,
} from '../../schemas/product.schema';

const SORT_MAP: Record<ListProductsQuery['sort'], Record<string, SortOrder>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
};

export async function listProducts(query: ListProductsQuery) {
  const { search, sort, minPrice, maxPrice, page, limit } = query;

  const filter: FilterQuery<Product> = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const [docs, total] = await Promise.all([
    ProductModel.find(filter)
      .sort(SORT_MAP[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => d.toJSON()),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductById(id: string) {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product.toJSON();
}

export async function createProduct(input: CreateProductInput) {
  const product = await ProductModel.create(input);
  return product.toJSON();
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await ProductModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product.toJSON();
}

export async function deleteProduct(id: string) {
  const deleted = await ProductModel.findByIdAndDelete(id);
  if (!deleted) {
    throw ApiError.notFound('Product not found');
  }
}
