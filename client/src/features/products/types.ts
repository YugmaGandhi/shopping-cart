export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  createdAt: string;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc';

export interface ProductListArgs {
  search?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
