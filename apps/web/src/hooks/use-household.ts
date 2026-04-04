import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Household,
  HouseholdMember,
  HouseholdInvite,
  ApiResponse,
  UserRole,
} from '@groceries-ai/shared-types';

// Mock data for development
const mockMembers: HouseholdMember[] = [
  {
    id: '1',
    displayName: 'Carlos Franco',
    email: 'carlos@example.com',
    role: 'ADMIN' as UserRole,
  },
  {
    id: '2',
    displayName: 'Alejandro',
    email: 'alejo@example.com',
    role: 'MEMBER' as UserRole,
  },
];

const mockHousehold = {
  id: 'h1',
  name: 'Casa Franco',
  members: mockMembers,
  invites: [] as HouseholdInvite[],
};

// Toggle this to false when backend is ready
const USE_MOCK = true;

export function useHousehold() {
  return useQuery({
    queryKey: ['household'],
    queryFn: async () => {
      if (USE_MOCK) return mockHousehold;
      return apiClient.get<typeof mockHousehold>('/households/me');
    },
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (USE_MOCK) return { ...mockHousehold, name };
      return apiClient.post<ApiResponse<Household>>('/households', { name });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['household'] }),
  });
}

export function useJoinHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (USE_MOCK) return mockHousehold;
      return apiClient.post<ApiResponse<Household>>('/households/join', {
        inviteCode,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['household'] }),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email?: string) => {
      if (USE_MOCK)
        return {
          id: 'inv1',
          code: 'ABC123XY',
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
      return apiClient.post<{ id: string; code: string; expiresAt: string }>(
        '/households/me/invite',
        email ? { email } : {},
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['household'] }),
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      if (USE_MOCK) return;
      return apiClient.delete(`/households/me/invites/${inviteId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['household'] }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (USE_MOCK) return;
      return apiClient.delete(`/households/me/members/${userId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['household'] }),
  });
}
