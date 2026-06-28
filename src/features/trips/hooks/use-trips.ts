'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Trip } from '@/generated/prisma/client';
import type { PaginationMeta } from '@/types';
import type { CreateTripInput, UpdateTripInput } from '@/lib/validators';

interface TripsResponse {
  data: Trip[];
  meta: PaginationMeta;
}

interface TripsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  search?: string;
}

export function useTrips(params: TripsParams = {}) {
  return useQuery<TripsResponse>({
    queryKey: ['trips', params],
    queryFn: async () => {
      const searchParams: Record<string, string | number> = {};
      if (params.page) searchParams.page = params.page;
      if (params.pageSize) searchParams.pageSize = params.pageSize;
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      if (params.sortOrder) searchParams.sortOrder = params.sortOrder;
      if (params.status) searchParams.status = params.status;
      if (params.search) searchParams.search = params.search;

      const res = await fetch(
        `/api/trips?${new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, String(v)]))}`,
        { method: 'GET' }
      );
      return res.json();
    },
  });
}

export function useTrip(id: string | null) {
  return useQuery<Trip>({
    queryKey: ['trip', id],
    queryFn: () => apiClient<Trip>(`/api/trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripInput) =>
      apiClient<Trip>('/api/trips', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTripInput }) =>
      apiClient<Trip>(`/api/trips/${id}`, { method: 'PUT', body: data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ deleted: boolean }>(`/api/trips/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
