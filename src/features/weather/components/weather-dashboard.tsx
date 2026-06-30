'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherBackground } from '@/components/common/weather-background';
import { ErrorDisplay } from '@/components/common/error-display';
import { WeatherSearch } from '@/features/search/components/weather-search';
import { FavouritesList } from '@/features/search/components/favourites-list';
import { RecentSearchesSidebar } from '@/features/search/components/recent-searches-sidebar';
import { SavedSidebar } from '@/features/search/components/saved-sidebar';
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
  const urlParams = useSearchParams();

  const [searchState, setSearchState] = useState<{
    query: string | null;
    lat?: number;
    lon?: number;
  }>(() => {
    const urlLat = urlParams.get('lat');
    const urlLon = urlParams.get('lon');
    const urlQ = urlParams.get('q');
    if (urlLat && urlLon) {
      return {
        query: urlQ || `${urlLat},${urlLon}`,
        lat: parseFloat(urlLat),
        lon: parseFloat(urlLon),
      };
    }
    return { query: null };
  });

  const [gpsError, setGpsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
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
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location access denied. Search for a city instead.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Could not determine your location. Search for a city instead.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('Location request timed out. Search for a city instead.');
        }
      },
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
    setGpsError(null);
    setSearchState({ query, lat, lon });
  }, []);

  const handleFavouriteSelect = useCallback(
    (city: string, lat: number, lon: number) => {
      handleSearch(city, lat, lon);
    },
    [handleSearch]
  );

  const currentCondition = weatherData?.current?.condition;
  const isDay = weatherData?.current
    ? new Date() > new Date(weatherData.current.sunrise) &&
      new Date() < new Date(weatherData.current.sunset)
    : true;

  return (
    <WeatherBackground condition={currentCondition} isDay={isDay}>
      <div className="container mx-auto px-4 py-6 overflow-hidden">
        <div className="mb-6">
          <WeatherSearch onSearch={handleSearch} />
        </div>

        <div className="relative">
          {/* Left sidebar — recent searches (absolute, doesn't push content) */}
          <RecentSearchesSidebar
            onSelect={(city, lat, lon) => handleSearch(city, lat, lon)}
            activeCity={weatherData?.current?.location?.city}
          />

          {/* Right sidebar — saved locations */}
          <SavedSidebar
            onSelect={(city, lat, lon) => handleSearch(city, lat, lon)}
            activeCity={weatherData?.current?.location?.city}
          />

          {/* Main content — stays centered */}
          <div className="space-y-6">
            {gpsError && !weatherData && (
              <ErrorDisplay error={new Error(gpsError)} compact className="max-w-lg mx-auto" />
            )}

            {weatherError && (
              <ErrorDisplay
                error={weatherError}
                onRetry={() => refetchWeather()}
                className="max-w-lg mx-auto"
              />
            )}

            {weatherLoading && <WeatherSkeleton />}

            {weatherData && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <SaveFavouriteButton weather={weatherData.current} />
                </div>

                <Tabs
                  defaultValue="overview"
                  onValueChange={(val: string | null) => {
                    if (val) setActiveTab(val);
                  }}
                >
                  <div className="flex justify-center mb-6 -mx-4 px-4 overflow-x-auto">
                    <TabsList className="overflow-x-auto overflow-y-hidden bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full px-1 shrink-0">
                      <TabsTrigger value="overview" className="rounded-full text-xs">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="hourly" className="rounded-full text-xs">
                        Hourly
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="rounded-full text-xs">
                        Travel
                      </TabsTrigger>
                      <TabsTrigger value="health" className="rounded-full text-xs">
                        Health
                      </TabsTrigger>
                      <TabsTrigger value="packing" className="rounded-full text-xs">
                        Packing
                      </TabsTrigger>
                      <TabsTrigger value="destination" className="rounded-full text-xs">
                        Destination
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-4">
                    <CurrentWeather data={weatherData.current} />
                    <HourlyForecast
                      hourly={weatherData.hourly}
                      timezone={weatherData.current.timezone}
                    />
                    <ForecastCards forecast={weatherData.forecast} />
                  </TabsContent>

                  <TabsContent value="hourly">
                    <HourlyForecast
                      hourly={weatherData.hourly}
                      timezone={weatherData.current.timezone}
                    />
                  </TabsContent>

                  <TabsContent value="insights" className="max-w-2xl mx-auto">
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

                  <TabsContent value="health" className="max-w-2xl mx-auto">
                    <HealthAdvisor current={weatherData.current} forecast={weatherData.forecast} />
                  </TabsContent>

                  <TabsContent value="packing" className="max-w-2xl mx-auto">
                    <PackingChecklist
                      current={weatherData.current}
                      forecast={weatherData.forecast}
                    />
                  </TabsContent>

                  <TabsContent value="destination" className="space-y-6 max-w-2xl mx-auto">
                    {activeTab === 'destination' && (
                      <LocationMap
                        latitude={weatherData.current.location.latitude}
                        longitude={weatherData.current.location.longitude}
                        city={weatherData.current.location.city}
                      />
                    )}
                    <TravelVideos city={weatherData.current.location.city} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {!weatherData && !weatherLoading && !weatherError && (
              <motion.div
                className="flex flex-col items-center justify-center py-12 sm:py-20 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="text-7xl mb-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  🌍
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                  Explore any destination
                </h2>
                <p className="text-foreground/60 max-w-md text-lg mb-8">
                  Get real-time weather, travel insights, packing lists, and health advice for
                  anywhere in the world.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {['London', 'Tokyo', 'New York', 'Paris', 'Sydney'].map((city) => (
                    <motion.button
                      key={city}
                      onClick={() => handleSearch(city)}
                      className="px-4 py-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium hover:bg-white/30 dark:hover:bg-white/20 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
                <div className="w-full max-w-sm">
                  <h4 className="text-sm font-semibold mb-3 text-foreground/40 uppercase tracking-wider">
                    Favourites
                  </h4>
                  <FavouritesList onSelect={handleFavouriteSelect} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </WeatherBackground>
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
