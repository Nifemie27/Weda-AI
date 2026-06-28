'use client';

import { useCallback, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherSearch } from '@/features/search/components/weather-search';
import { useWeather } from '../hooks/use-weather';
import { useInsights } from '../hooks/use-insights';
import { CurrentWeather } from './current-weather';
import { ForecastCards } from './forecast-cards';
import { HourlyForecast } from './hourly-forecast';
import { WeatherInsights } from './weather-insights';

export function WeatherDashboard() {
  const [searchState, setSearchState] = useState<{
    query: string | null;
    lat?: number;
    lon?: number;
  }>({ query: null });

  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeather(searchState.query, searchState.lat, searchState.lon);

  const { data: insightsData, isLoading: insightsLoading } = useInsights(
    searchState.query,
    searchState.lat,
    searchState.lon
  );

  const handleSearch = useCallback((query: string, lat?: number, lon?: number) => {
    setSearchState({ query, lat, lon });
  }, []);

  return (
    <div className="space-y-8">
      <WeatherSearch onSearch={handleSearch} />

      {weatherError && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              {weatherError instanceof Error
                ? weatherError.message
                : 'Failed to load weather data. Please try again.'}
            </p>
          </CardContent>
        </Card>
      )}

      {weatherLoading && <WeatherSkeleton />}

      {weatherData && (
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="insights">Travel Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <CurrentWeather data={weatherData.current} />
            <ForecastCards forecast={weatherData.forecast} />
          </TabsContent>

          <TabsContent value="hourly">
            <HourlyForecast hourly={weatherData.hourly} timezone={weatherData.current.timezone} />
          </TabsContent>

          <TabsContent value="insights">
            {insightsLoading ? (
              <InsightsSkeleton />
            ) : insightsData ? (
              <WeatherInsights
                summary={insightsData.summary}
                insights={insightsData.insights}
                travelConditions={insightsData.travelConditions}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      )}

      {!weatherData && !weatherLoading && !weatherError && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Search for any location to see weather and travel insights.</p>
          <p className="text-sm mt-2">
            Try a city name, postal code, coordinates, or use your current location.
          </p>
        </div>
      )}
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div>
                <Skeleton className="h-12 w-32 mb-2" />
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-7 w-28 mb-1 ml-auto" />
              <Skeleton className="h-5 w-20 ml-auto" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
