'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { STALE_TIME } from '@/lib/constants';
import type { ForecastDay, HourlyForecast, LocationInfo } from '../types';

interface ForecastData {
  location: LocationInfo;
  forecast: ForecastDay[];
  hourly: HourlyForecast[];
}

export function useForecast(query: string | null, lat?: number, lon?: number) {
  return useQuery<ForecastData>({
    queryKey: ['forecast', query, lat, lon],
    queryFn: () => {
      const params: Record<string, string | number> = {};
      if (lat !== undefined && lon !== undefined) {
        params.lat = lat;
        params.lon = lon;
      } else if (query) {
        params.q = query;
      }
      return apiClient<ForecastData>('/api/weather/forecast', { params });
    },
    enabled: !!(query || (lat !== undefined && lon !== undefined)),
    staleTime: STALE_TIME.FORECAST,
    retry: 1,
  });
}
