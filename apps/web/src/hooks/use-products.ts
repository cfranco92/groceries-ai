import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UnitType } from '@groceries-ai/shared-types';
import type {
  Product,
  Category,
  PaginatedResponse,
} from '@groceries-ai/shared-types';

const USE_MOCK = true;

// ─── Mock Data ──────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Dairy', icon: 'milk', sortOrder: 1 },
  { id: 'cat2', name: 'Meat & Fish', icon: 'beef', sortOrder: 2 },
  { id: 'cat3', name: 'Fruits & Vegetables', icon: 'apple', sortOrder: 3 },
  { id: 'cat4', name: 'Bakery', icon: 'croissant', sortOrder: 4 },
  { id: 'cat5', name: 'Beverages', icon: 'coffee', sortOrder: 5 },
  { id: 'cat6', name: 'Grains & Pasta', icon: 'wheat', sortOrder: 6 },
  { id: 'cat7', name: 'Cleaning', icon: 'sparkles', sortOrder: 7 },
  { id: 'cat8', name: 'Personal Care', icon: 'heart', sortOrder: 8 },
  { id: 'cat9', name: 'Snacks', icon: 'candy', sortOrder: 9 },
  { id: 'cat10', name: 'Frozen', icon: 'snowflake', sortOrder: 10 },
  { id: 'cat11', name: 'Canned Goods', icon: 'archive', sortOrder: 11 },
  { id: 'cat12', name: 'Condiments', icon: 'flask', sortOrder: 12 },
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Whole Milk',
    categoryId: 'cat1',
    householdId: 'h1',
    defaultUnit: UnitType.UNIT,
    avgPrice: 3.5,
    lastPurchasedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    purchaseCount: 12,
    avgDaysBetweenPurchases: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Chicken Breast',
    categoryId: 'cat2',
    householdId: 'h1',
    defaultUnit: UnitType.KG,
    avgPrice: 8.2,
    lastPurchasedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    purchaseCount: 8,
    avgDaysBetweenPurchases: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Whole Wheat Bread',
    categoryId: 'cat4',
    householdId: 'h1',
    defaultUnit: UnitType.UNIT,
    avgPrice: 2.1,
    lastPurchasedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    purchaseCount: 6,
    avgDaysBetweenPurchases: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Bananas',
    categoryId: 'cat3',
    householdId: 'h1',
    defaultUnit: UnitType.KG,
    avgPrice: 1.8,
    lastPurchasedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    purchaseCount: 15,
    avgDaysBetweenPurchases: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Orange Juice',
    categoryId: 'cat5',
    householdId: 'h1',
    defaultUnit: UnitType.L,
    avgPrice: 4.5,
    lastPurchasedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    purchaseCount: 5,
    avgDaysBetweenPurchases: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Eggs',
    categoryId: 'cat1',
    householdId: 'h1',
    defaultUnit: UnitType.DOZEN,
    avgPrice: 5.0,
    lastPurchasedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    purchaseCount: 10,
    avgDaysBetweenPurchases: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p7',
    name: 'Rice',
    categoryId: 'cat6',
    householdId: 'h1',
    defaultUnit: UnitType.KG,
    avgPrice: 3.2,
    lastPurchasedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    purchaseCount: 4,
    avgDaysBetweenPurchases: 21,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p8',
    name: 'Skim Milk',
    categoryId: 'cat1',
    householdId: 'h1',
    defaultUnit: UnitType.UNIT,
    avgPrice: 2.8,
    lastPurchasedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    purchaseCount: 3,
    avgDaysBetweenPurchases: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Hooks ──────────────────────────────────────────────

interface ProductsParams {
  search?: string;
  categoryId?: string;
  sortBy?: 'alphabetical' | 'mostPurchased' | 'recentlyPurchased';
  page?: number;
  limit?: number;
}

export function useProducts(
  params: ProductsParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      if (USE_MOCK) {
        let filtered = [...mockProducts];

        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(q),
          );
        }
        if (params.categoryId) {
          filtered = filtered.filter((p) => p.categoryId === params.categoryId);
        }

        switch (params.sortBy) {
          case 'alphabetical':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'recentlyPurchased':
            filtered.sort((a, b) => {
              if (!a.lastPurchasedAt) return 1;
              if (!b.lastPurchasedAt) return -1;
              return new Date(b.lastPurchasedAt).getTime() - new Date(a.lastPurchasedAt).getTime();
            });
            break;
          case 'mostPurchased':
          default:
            filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
            break;
        }

        const limit = params.limit ?? 10;
        const page = params.page ?? 1;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);

        return {
          data: paged,
          meta: {
            total: filtered.length,
            page,
            limit,
            hasNextPage: start + limit < filtered.length,
          },
        };
      }

      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      return apiClient.get<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
    },
    enabled: options?.enabled ?? true,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (USE_MOCK) {
        const product = mockProducts.find((p) => p.id === id);
        if (!product) throw new Error('Product not found');
        return product;
      }
      return apiClient.get<Product>(`/products/${id}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      categoryId?: string;
      defaultUnit?: string;
    }) => {
      if (USE_MOCK) return;
      return apiClient.patch<Product>(`/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (USE_MOCK) return mockCategories;
      return apiClient.get<Category[]>('/categories');
    },
    staleTime: 1000 * 60 * 60, // 1 hour — categories rarely change
  });
}

// ─── Mock purchase history for product detail ───────────

export interface PurchaseHistoryEntry {
  date: string;
  price: number;
  quantity: number;
  receiptId: string;
}

export function useProductPurchaseHistory(productId: string) {
  return useQuery({
    queryKey: ['product-history', productId],
    queryFn: async (): Promise<PurchaseHistoryEntry[]> => {
      if (USE_MOCK) {
        return [
          { date: new Date(Date.now() - 2 * 86400000).toISOString(), price: 3.8, quantity: 2, receiptId: 'r1' },
          { date: new Date(Date.now() - 9 * 86400000).toISOString(), price: 3.5, quantity: 1, receiptId: 'r2' },
          { date: new Date(Date.now() - 16 * 86400000).toISOString(), price: 3.5, quantity: 2, receiptId: 'r3' },
          { date: new Date(Date.now() - 23 * 86400000).toISOString(), price: 3.2, quantity: 1, receiptId: 'r4' },
        ];
      }
      // Real API: product detail endpoint would include purchase history
      return apiClient.get<PurchaseHistoryEntry[]>(`/products/${productId}/history`);
    },
  });
}
