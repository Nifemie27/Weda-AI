'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { STALE_TIME } from '@/lib/constants';
import type { CurrentWeather, ForecastDay, HourlyForecast, LocationInfo } from '../types';
import type { WeatherInsight, TravelConditions } from '../services/insights';

interface InsightsData {
  location: LocationInfo;
  summary: string;
  insights: WeatherInsight[];
  travelConditions: TravelConditions;
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyForecast[];
}

export function useInsights(query: string | null, lat?: number, lon?: number) {
  return useQuery<InsightsData>({
    queryKey: ['insights', query, lat, lon],
    queryFn: () => {
      const params: Record<string, string | number> = {};
      if (lat !== undefined && lon !== undefined) {
        params.lat = lat;
        params.lon = lon;
      } else if (query) {
        params.q = query;
      }
      return apiClient<InsightsData>('/api/insights', { params });
    },
    enabled: !!(query || (lat !== undefined && lon !== undefined)),
    staleTime: STALE_TIME.WEATHER,
    retry: 1,
  });
}
