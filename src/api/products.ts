import type { ProductsResponse } from '../types/product';

const BASE_URL = 'https://dummyjson.com';

interface FetchProductsParams {
  limit: number;
  skip: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export async function fetchProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const query = new URLSearchParams({
    limit: String(params.limit),
    skip: String(params.skip),
    select: 'id,title,category,price,rating,brand,sku,stock,thumbnail',
  });

  if (params.sortBy) {
    query.set('sortBy', params.sortBy);
    query.set('order', params.order ?? 'asc');
  }

  const response = await fetch(`${BASE_URL}/products?${query}`);
  if (!response.ok) throw new Error('Ошибка загрузки товаров');
  return response.json();
}

export async function searchProducts(
  query: string,
  params: FetchProductsParams,
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams({
    q: query,
    limit: String(params.limit),
    skip: String(params.skip),
    select: 'id,title,category,price,rating,brand,sku,stock,thumbnail',
  });

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
    searchParams.set('order', params.order ?? 'asc');
  }

  const response = await fetch(`${BASE_URL}/products/search?${searchParams}`);
  if (!response.ok) throw new Error('Ошибка поиска товаров');
  return response.json();
}
