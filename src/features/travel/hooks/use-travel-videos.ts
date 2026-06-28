'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { STALE_TIME } from '@/lib/constants';
import type { YouTubeVideo } from '../types';

export function useTravelVideos(city: string | null) {
  return useQuery<YouTubeVideo[]>({
    queryKey: ['travelVideos', city],
    queryFn: () =>
      apiClient<YouTubeVideo[]>('/api/youtube', {
        params: { q: city! },
      }),
    enabled: !!city,
    staleTime: STALE_TIME.STATIC,
    retry: 1,
  });
}
