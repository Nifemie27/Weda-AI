'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessage } from '@/components/common/error-message';
import { useWeatherBg } from '@/providers/weather-bg-provider';
import { WeatherSearch } from '@/features/search/components/weather-search';
import { FavouritesList } from '@/features/search/components/favourites-list';
import { TravelVideos } from '@/features/travel/components/travel-videos';
import { HealthAdvisor } from '@/features/travel/components/health-advisor';
import { PackingChecklist } from '@/features/packing/components/packing-checklist';
import { useWeather } from '../hooks/use-weather';
import { useInsights } from '../hooks/use-insights';
import { CurrentWeather } from './current-weather';
import { ForecastCards } from './forecast-cards';
import { HourlyForecast } from './hourly-forecast';
import { WeatherInsights } from './weather-insights';
import { LocationMap } from './location-map';
import { SaveFavouriteButton } from './save-favourite-button';

export function WeatherDashboard() {
  const [searchState, setSearchState] = useState<{
    query: string | null;
    lat?: number;
    lon?: number;
  }>({ query: null });

  const autoLocatedRef = useRef(false);

  useEffect(() => {
    if (autoLocatedRef.current || searchState.query) return;
    autoLocatedRef.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchState({
          query: `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  }, [searchState.query]);

  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeather(searchState.query, searchState.lat, searchState.lon);

  const { data: insightsData, isLoading: insightsLoading } = useInsights(
    searchState.query,
    searchState.lat,
    searchState.lon
  );

  const handleSearch = useCallback((query: string, lat?: number, lon?: number) => {
    setSearchState({ query, lat, lon });
  }, []);

  const handleFavouriteSelect = useCallback(
    (city: string, lat: number, lon: number) => {
      handleSearch(city, lat, lon);
    },
    [handleSearch]
  );

  const { setWeatherBg } = useWeatherBg();

  useEffect(() => {
    if (weatherData?.current) {
      const now = new Date();
      const day =
        now > new Date(weatherData.current.sunrise) && now < new Date(weatherData.current.sunset);
      setWeatherBg(weatherData.current.condition, day);
    } else {
      setWeatherBg(null, true);
    }
  }, [weatherData, setWeatherBg]);

  return (
    <div className="space-y-8 container mx-auto px-4 py-6 overflow-hidden">
      <WeatherSearch onSearch={handleSearch} />

      {weatherError && (
        <ErrorMessage
          error={
            weatherError instanceof Error ? weatherError : new Error('Failed to load weather data.')
          }
          onRetry={() => refetchWeather()}
        />
      )}

      {weatherLoading && <WeatherSkeleton />}

      {weatherData && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {weatherData.current.location.city}, {weatherData.current.location.country}
              </h2>
              <SaveFavouriteButton weather={weatherData.current} />
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-6 w-full overflow-x-auto overflow-y-hidden">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="hourly">Hourly</TabsTrigger>
                <TabsTrigger value="insights">Travel</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="packing">Packing</TabsTrigger>
                <TabsTrigger value="destination">Destination</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <CurrentWeather data={weatherData.current} />
                <ForecastCards forecast={weatherData.forecast} />
              </TabsContent>

              <TabsContent value="hourly">
                <HourlyForecast
                  hourly={weatherData.hourly}
                  timezone={weatherData.current.timezone}
                />
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

              <TabsContent value="health">
                <HealthAdvisor current={weatherData.current} forecast={weatherData.forecast} />
              </TabsContent>

              <TabsContent value="packing">
                <PackingChecklist current={weatherData.current} forecast={weatherData.forecast} />
              </TabsContent>

              <TabsContent value="destination" className="space-y-8">
                <LocationMap
                  latitude={weatherData.current.location.latitude}
                  longitude={weatherData.current.location.longitude}
                  city={weatherData.current.location.city}
                />
                <TravelVideos city={weatherData.current.location.city} />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="lg:w-72 shrink-0">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Favourites
            </h3>
            <FavouritesList onSelect={handleFavouriteSelect} />
          </aside>
        </div>
      )}

      {!weatherData && !weatherLoading && !weatherError && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 text-center py-16 text-muted-foreground">
            <p className="text-lg">Detecting your location...</p>
            <p className="text-sm mt-2">
              Or search for any city, postal code, or coordinates above.
            </p>
          </div>
          <aside className="lg:w-72 shrink-0">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Favourites
            </h3>
            <FavouritesList onSelect={handleFavouriteSelect} />
          </aside>
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
