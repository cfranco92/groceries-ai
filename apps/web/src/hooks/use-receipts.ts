import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ReceiptStatus } from '@groceries-ai/shared-types';
import type {
  Receipt,
  ReceiptItem,
  PaginatedResponse,
} from '@groceries-ai/shared-types';

const USE_MOCK = true;

// ─── Mock Data ──────────────────────────────────────────

const mockReceiptItems: ReceiptItem[] = [
  { id: 'ri1', receiptId: 'r1', productId: 'p1', name: 'Whole Milk', quantity: 2, unitPrice: 3.5, totalPrice: 7.0, createdAt: new Date().toISOString() },
  { id: 'ri2', receiptId: 'r1', productId: 'p2', name: 'Chicken Breast', quantity: 1, unitPrice: 8.2, totalPrice: 8.2, createdAt: new Date().toISOString() },
  { id: 'ri3', receiptId: 'r1', productId: null, name: 'Lche entera', quantity: 1, unitPrice: 3.5, totalPrice: 3.5, createdAt: new Date().toISOString() },
  { id: 'ri4', receiptId: 'r1', productId: 'p4', name: 'Bananas', quantity: 1.5, unitPrice: 1.8, totalPrice: 2.7, createdAt: new Date().toISOString() },
  { id: 'ri5', receiptId: 'r1', productId: 'p6', name: 'Eggs', quantity: 1, unitPrice: 5.0, totalPrice: 5.0, createdAt: new Date().toISOString() },
  { id: 'ri6', receiptId: 'r1', productId: 'p3', name: 'Whole Wheat Bread', quantity: 1, unitPrice: 2.1, totalPrice: 2.1, createdAt: new Date().toISOString() },
  { id: 'ri7', receiptId: 'r1', productId: 'p5', name: 'Orange Juice', quantity: 1, unitPrice: 4.5, totalPrice: 4.5, createdAt: new Date().toISOString() },
  { id: 'ri8', receiptId: 'r1', productId: 'p7', name: 'Rice', quantity: 1, unitPrice: 3.2, totalPrice: 3.2, createdAt: new Date().toISOString() },
  { id: 'ri9', receiptId: 'r1', productId: null, name: 'Plastc bags', quantity: 2, unitPrice: 0.5, totalPrice: 1.0, createdAt: new Date().toISOString() },
  { id: 'ri10', receiptId: 'r1', productId: null, name: 'Dish soap', quantity: 1, unitPrice: 3.99, totalPrice: 3.99, createdAt: new Date().toISOString() },
  { id: 'ri11', receiptId: 'r1', productId: null, name: 'Tomatos', quantity: 3, unitPrice: 1.5, totalPrice: 4.5, createdAt: new Date().toISOString() },
  { id: 'ri12', receiptId: 'r1', productId: 'p8', name: 'Skim Milk', quantity: 1, unitPrice: 2.8, totalPrice: 2.8, createdAt: new Date().toISOString() },
];

type ReceiptWithItemCount = Receipt & { itemCount: number };

const mockReceipts: ReceiptWithItemCount[] = [
  {
    id: 'r1',
    householdId: 'h1',
    userId: 'u1',
    imageUrl: '',
    merchantName: 'Supermarket XYZ',
    purchaseDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    subtotal: 45.5,
    tax: 3.64,
    total: 49.14,
    status: ReceiptStatus.COMPLETED,
    processedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    rawOcrData: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    itemCount: 12,
  },
  {
    id: 'r2',
    householdId: 'h1',
    userId: 'u1',
    imageUrl: '',
    merchantName: null,
    purchaseDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    subtotal: null,
    tax: null,
    total: null,
    status: ReceiptStatus.PROCESSING,
    processedAt: null,
    rawOcrData: null,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    itemCount: 0,
  },
  {
    id: 'r3',
    householdId: 'h1',
    userId: 'u1',
    imageUrl: '',
    merchantName: 'Mini Market',
    purchaseDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    subtotal: 21.36,
    tax: 2.14,
    total: 23.5,
    status: ReceiptStatus.COMPLETED,
    processedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    rawOcrData: null,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    itemCount: 5,
  },
  {
    id: 'r4',
    householdId: 'h1',
    userId: 'u1',
    imageUrl: '',
    merchantName: 'Corner Store',
    purchaseDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    subtotal: null,
    tax: null,
    total: null,
    status: ReceiptStatus.FAILED,
    processedAt: null,
    rawOcrData: null,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    itemCount: 0,
  },
];

// ─── Hooks ──────────────────────────────────────────────

interface ReceiptsParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useReceipts(params: ReceiptsParams = {}) {
  return useQuery({
    queryKey: ['receipts', params],
    queryFn: async (): Promise<PaginatedResponse<ReceiptWithItemCount>> => {
      if (USE_MOCK) {
        let filtered = [...mockReceipts];

        if (params.status && params.status !== 'ALL') {
          filtered = filtered.filter((r) => r.status === params.status);
        }
        if (params.startDate) {
          const start = new Date(params.startDate).getTime();
          filtered = filtered.filter(
            (r) => new Date(r.purchaseDate ?? r.createdAt).getTime() >= start,
          );
        }
        if (params.endDate) {
          const end = new Date(params.endDate).getTime();
          filtered = filtered.filter(
            (r) => new Date(r.purchaseDate ?? r.createdAt).getTime() <= end,
          );
        }

        // Sort newest first
        filtered.sort(
          (a, b) =>
            new Date(b.purchaseDate ?? b.createdAt).getTime() -
            new Date(a.purchaseDate ?? a.createdAt).getTime(),
        );

        const limit = params.limit ?? 10;
        const page = params.page ?? 1;
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);

        return {
          data: paged,
          meta: { total: filtered.length, page, limit, hasNextPage: start + limit < filtered.length },
        };
      }

      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      if (params.page) queryParams.set('page', String(params.page));
      if (params.limit) queryParams.set('limit', String(params.limit));
      const qs = queryParams.toString();
      return apiClient.get<PaginatedResponse<ReceiptWithItemCount>>(`/receipts${qs ? `?${qs}` : ''}`);
    },
    // Poll for PROCESSING receipts
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasProcessing = data.data.some((r) => r.status === 'PROCESSING');
      return hasProcessing ? 5000 : false;
    },
  });
}

export type ReceiptWithItems = Receipt & { items: ReceiptItem[] };

export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: async (): Promise<ReceiptWithItems> => {
      if (USE_MOCK) {
        const receipt = mockReceipts.find((r) => r.id === id);
        if (!receipt) throw new Error('Receipt not found');
        const items =
          receipt.id === 'r1'
            ? mockReceiptItems
            : [];
        return { ...receipt, items };
      }
      return apiClient.get<ReceiptWithItems>(`/receipts/${id}`);
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'PROCESSING') return 5000;
      return false;
    },
  });
}

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      merchantName,
      purchaseDate,
    }: {
      file: File;
      merchantName?: string;
      purchaseDate?: string;
    }) => {
      if (USE_MOCK) {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return { id: `r${Date.now()}`, status: ReceiptStatus.PROCESSING };
      }

      const formData = new FormData();
      formData.append('file', file);
      if (merchantName) formData.append('merchantName', merchantName);
      if (purchaseDate) formData.append('purchaseDate', purchaseDate);

      const authHeaders = await getAuthHeadersForUpload();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/receipts`,
        {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
}

export function useUpdateReceiptItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      receiptId,
      itemId,
      ...data
    }: {
      receiptId: string;
      itemId: string;
      name?: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
      productId?: string;
    }) => {
      if (USE_MOCK) return;
      return apiClient.patch(`/receipts/${receiptId}/items/${itemId}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receipt', variables.receiptId] });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return;
      return apiClient.delete(`/receipts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
}

// Helper for multipart upload auth
async function getAuthHeadersForUpload(): Promise<Record<string, string>> {
  try {
    const { auth } = await import('@/lib/firebase');
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}
