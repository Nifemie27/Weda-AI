'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceId } from '@/hooks/use-device-id';
import type { WeatherSearch } from '@/generated/prisma/client';
import type { PaginationMeta } from '@/types';

interface HistoryResponse {
  data: WeatherSearch[];
  meta: PaginationMeta;
}

interface HistoryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  city?: string;
  country?: string;
}

export function useSearchHistory(params: HistoryParams = {}) {
  return useQuery<HistoryResponse>({
    queryKey: ['searchHistory', params],
    queryFn: async () => {
      const searchParams: Record<string, string | number> = {};
      if (params.page) searchParams.page = params.page;
      if (params.pageSize) searchParams.pageSize = params.pageSize;
      if (params.sortBy) searchParams.sortBy = params.sortBy;
      if (params.sortOrder) searchParams.sortOrder = params.sortOrder;
      if (params.city) searchParams.city = params.city;
      if (params.country) searchParams.country = params.country;

      const qs = new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, String(v)]));
      const res = await fetch(`/api/history?${qs}`, {
        headers: { 'X-Device-Id': getDeviceId() },
      });
      const json = await res.json();
      return { data: json.data, meta: json.meta };
    },
  });
}

export function useDeleteSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ deleted: boolean }>(`/api/history/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient<{ deleted: number }>('/api/history?all=true', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
}
