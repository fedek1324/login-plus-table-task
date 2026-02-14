import { create } from 'zustand';
import { fetchProducts, searchProducts } from '../api/products';
import type { Product } from '../types/product';

interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

interface ProductsState {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sort: SortState | null;
  isLoading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: SortState | null) => void;
  addProductLocally: (product: Product) => void;
}

const SORT_STORAGE_KEY = 'products_sort';

function getStoredSort(): SortState | null {
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SortState;
    if (parsed.field && (parsed.order === 'asc' || parsed.order === 'desc')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSort(sort: SortState | null): void {
  if (sort) {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort));
  } else {
    localStorage.removeItem(SORT_STORAGE_KEY);
  }
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  sort: getStoredSort(),
  isLoading: false,
  error: null,

  loadProducts: async () => {
    const { page, pageSize, search, sort } = get();
    set({ isLoading: true, error: null });

    try {
      const skip = (page - 1) * pageSize;
      const params = {
        limit: pageSize,
        skip,
        sortBy: sort?.field,
        order: sort?.order,
      };

      const data = search.trim()
        ? await searchProducts(search.trim(), params)
        : await fetchProducts(params);

      set({ products: data.products, total: data.total, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      set({ error: message, isLoading: false });
    }
  },

  setPage: (page) => {
    set({ page });
    get().loadProducts();
  },

  setSearch: (search) => {
    set({ search, page: 1 });
    get().loadProducts();
  },

  setSort: (sort) => {
    saveSort(sort);
    set({ sort });
    get().loadProducts();
  },

  addProductLocally: (product) => {
    set((state) => ({
      products: [product, ...state.products],
      total: state.total + 1,
    }));
  },
}));
