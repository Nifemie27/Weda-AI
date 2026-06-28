'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FavouriteLocation } from '@/generated/prisma/client';
import type { PaginationMeta } from '@/types';
import type { CreateFavouriteInput, UpdateFavouriteInput } from '@/lib/validators';

interface FavouritesResponse {
  data: FavouriteLocation[];
  meta: PaginationMeta;
}

export function useFavourites(search?: string) {
  return useQuery<FavouritesResponse>({
    queryKey: ['favourites', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/favourites?${params}`);
      const json = await res.json();
      return { data: json.data, meta: json.meta };
    },
  });
}

export function useAddFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFavouriteInput) =>
      apiClient<FavouriteLocation>('/api/favourites', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}

export function useUpdateFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFavouriteInput }) =>
      apiClient<FavouriteLocation>(`/api/favourites/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}

export function useDeleteFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ deleted: boolean }>(`/api/favourites/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}
