'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks';
import { STALE_TIME } from '@/lib/constants';
import type { GeocodingResult } from '@/features/weather/types';

export function useGeocode(query: string) {
  const debouncedQuery = useDebounce(query, 350);

  return useQuery<GeocodingResult[]>({
    queryKey: ['geocode', debouncedQuery],
    queryFn: () =>
      apiClient<GeocodingResult[]>('/api/geocode', {
        params: { q: debouncedQuery },
      }),
    enabled: debouncedQuery.length >= 2,
    staleTime: STALE_TIME.STATIC,
  });
}
