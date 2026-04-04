import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ListStatus,
  UnitType,
} from '@groceries-ai/shared-types';
import type { ShoppingList, ListItem } from '@groceries-ai/shared-types';

const USE_MOCK = true;

const mockItems: ListItem[] = [
  {
    id: 'i1',
    name: 'Whole Milk',
    quantity: 2,
    unit: UnitType.UNIT,
    isChecked: false,
    sortOrder: 0,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i2',
    name: 'Bread',
    quantity: 1,
    unit: UnitType.UNIT,
    isChecked: false,
    sortOrder: 1,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i3',
    name: 'Chicken breast',
    quantity: 1,
    unit: UnitType.KG,
    isChecked: false,
    sortOrder: 2,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i4',
    name: 'Tomatoes',
    quantity: 500,
    unit: UnitType.G,
    isChecked: false,
    sortOrder: 3,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i5',
    name: 'Eggs',
    quantity: 12,
    unit: UnitType.UNIT,
    isChecked: true,
    sortOrder: 4,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i6',
    name: 'Rice',
    quantity: 1,
    unit: UnitType.KG,
    isChecked: true,
    sortOrder: 5,
    listId: 'l1',
    productId: null,
    addedById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type ListWithMeta = ShoppingList & {
  itemCount: number;
  checkedCount: number;
  createdByName: string;
};

const mockLists: ListWithMeta[] = [
  {
    id: 'l1',
    name: 'Weekly Groceries',
    status: ListStatus.ACTIVE,
    householdId: 'h1',
    createdById: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: 6,
    checkedCount: 2,
    createdByName: 'Carlos',
  },
  {
    id: 'l2',
    name: 'Party Supplies',
    status: ListStatus.ACTIVE,
    householdId: 'h1',
    createdById: 'u2',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    itemCount: 5,
    checkedCount: 0,
    createdByName: 'Alejandro',
  },
  {
    id: 'l3',
    name: 'Last Week',
    status: ListStatus.COMPLETED,
    householdId: 'h1',
    createdById: 'u1',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    itemCount: 12,
    checkedCount: 12,
    createdByName: 'Carlos',
  },
];

export function useLists(status?: string) {
  return useQuery({
    queryKey: ['lists', status],
    queryFn: async () => {
      if (USE_MOCK) {
        if (!status || status === 'ALL') return mockLists;
        return mockLists.filter((l) => l.status === status);
      }
      const params = status && status !== 'ALL' ? `?status=${status}` : '';
      return apiClient.get<ListWithMeta[]>(`/lists${params}`);
    },
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      if (USE_MOCK) {
        const list = mockLists.find((l) => l.id === id) || mockLists[0];
        return { ...list, items: mockItems };
      }
      return apiClient.get<ListWithMeta & { items: ListItem[] }>(
        `/lists/${id}`,
      );
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (USE_MOCK)
        return {
          id: `l${Date.now()}`,
          name,
          status: ListStatus.ACTIVE,
          householdId: 'h1',
          createdById: 'u1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      return apiClient.post<ShoppingList>('/lists', { name });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      status?: ListStatus;
    }) => {
      if (USE_MOCK) return;
      return apiClient.patch<ShoppingList>(`/lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['list'] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return;
      return apiClient.delete(`/lists/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listId,
      name,
      quantity,
      unit,
      notes,
    }: {
      listId: string;
      name: string;
      quantity?: number;
      unit?: string;
      notes?: string;
    }) => {
      if (USE_MOCK)
        return {
          id: `i${Date.now()}`,
          name,
          quantity: quantity || 1,
          unit: unit || 'UNIT',
          isChecked: false,
          sortOrder: 0,
          listId,
          productId: null,
          addedById: 'u1',
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      return apiClient.post<ListItem>(`/lists/${listId}/items`, {
        name,
        quantity,
        unit,
        notes,
      });
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listId,
      itemId,
      ...data
    }: {
      listId: string;
      itemId: string;
      name?: string;
      quantity?: number;
      unit?: string;
      isChecked?: boolean;
      notes?: string;
    }) => {
      if (USE_MOCK) return;
      return apiClient.patch<ListItem>(
        `/lists/${listId}/items/${itemId}`,
        data,
      );
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listId,
      itemId,
    }: {
      listId: string;
      itemId: string;
    }) => {
      if (USE_MOCK) return;
      return apiClient.delete(`/lists/${listId}/items/${itemId}`);
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] }),
  });
}

export function useReorderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listId,
      itemIds,
    }: {
      listId: string;
      itemIds: string[];
    }) => {
      if (USE_MOCK) return;
      return apiClient.patch(`/lists/${listId}/items/reorder`, { itemIds });
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] }),
  });
}
