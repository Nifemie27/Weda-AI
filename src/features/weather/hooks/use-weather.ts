'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { STALE_TIME } from '@/lib/constants';
import type { CurrentWeather, ForecastDay, HourlyForecast } from '../types';

interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  hourly: HourlyForecast[];
}

export function useWeather(query: string | null, lat?: number, lon?: number) {
  return useQuery<WeatherData>({
    queryKey: ['weather', query, lat, lon],
    queryFn: () => {
      const params: Record<string, string | number> = {};
      if (lat !== undefined && lon !== undefined) {
        params.lat = lat;
        params.lon = lon;
      } else if (query) {
        params.q = query;
      }
      return apiClient<WeatherData>('/api/weather/current', { params });
    },
    enabled: !!(query || (lat !== undefined && lon !== undefined)),
    staleTime: STALE_TIME.WEATHER,
    retry: 1,
  });
}
