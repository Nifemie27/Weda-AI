'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeftRight, Droplets, Wind, Eye, Thermometer, Cloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherSearch } from '@/features/search/components/weather-search';
import { useWeather } from '@/features/weather/hooks/use-weather';
import {
  getWeatherIconUrl,
  formatTemperature,
  formatWindSpeed,
  formatVisibility,
  formatPercent,
} from '@/features/weather/utils';
import { AQI_LABELS } from '@/lib/constants';
import type { CurrentWeather } from '@/features/weather/types';

export function DestinationCompare() {
  const [locationA, setLocationA] = useState<{
    query: string | null;
    lat?: number;
    lon?: number;
  }>({ query: null });

  const [locationB, setLocationB] = useState<{
    query: string | null;
    lat?: number;
    lon?: number;
  }>({ query: null });

  const { data: weatherA, isLoading: loadingA } = useWeather(
    locationA.query,
    locationA.lat,
    locationA.lon
  );
  const { data: weatherB, isLoading: loadingB } = useWeather(
    locationB.query,
    locationB.lat,
    locationB.lon
  );

  const handleSearchA = useCallback((query: string, lat?: number, lon?: number) => {
    setLocationA({ query, lat, lon });
  }, []);

  const handleSearchB = useCallback((query: string, lat?: number, lon?: number) => {
    setLocationB({ query, lat, lon });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Destinations</h1>
        <p className="text-muted-foreground text-sm">
          Compare weather conditions between two locations side by side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Location A
          </h3>
          <WeatherSearch onSearch={handleSearchA} placeholder="Search first location..." />
          {loadingA && <Skeleton className="h-48 rounded-lg" />}
          {weatherA && <CompactWeatherCard weather={weatherA.current} side="A" />}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Location B
          </h3>
          <WeatherSearch onSearch={handleSearchB} placeholder="Search second location..." />
          {loadingB && <Skeleton className="h-48 rounded-lg" />}
          {weatherB && <CompactWeatherCard weather={weatherB.current} side="B" />}
        </div>
      </div>

      {weatherA && weatherB && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ComparisonTable a={weatherA.current} b={weatherB.current} />
        </motion.div>
      )}
    </div>
  );
}

function CompactWeatherCard({ weather, side }: { weather: CurrentWeather; side: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src={getWeatherIconUrl(weather.conditionIcon, '2x')}
            alt={weather.conditionDescription}
            width={48}
            height={48}
            unoptimized
          />
          <div>
            <p className="font-semibold">
              {weather.location.city}, {weather.location.country}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatTemperature(weather.temperature)}</span>
              <span className="text-sm text-muted-foreground capitalize">
                {weather.conditionDescription}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            {side}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface ComparisonRow {
  label: string;
  icon: React.ReactNode;
  valueA: string | number;
  valueB: string | number;
  unit?: string;
  winner?: 'A' | 'B' | 'tie';
}

function ComparisonTable({ a, b }: { a: CurrentWeather; b: CurrentWeather }) {
  const rows: ComparisonRow[] = [
    {
      label: 'Temperature',
      icon: <Thermometer className="h-4 w-4" />,
      valueA: formatTemperature(a.temperature),
      valueB: formatTemperature(b.temperature),
    },
    {
      label: 'Feels Like',
      icon: <Thermometer className="h-4 w-4" />,
      valueA: formatTemperature(a.feelsLike),
      valueB: formatTemperature(b.feelsLike),
    },
    {
      label: 'Humidity',
      icon: <Droplets className="h-4 w-4" />,
      valueA: formatPercent(a.humidity),
      valueB: formatPercent(b.humidity),
      winner: a.humidity < b.humidity ? 'A' : a.humidity > b.humidity ? 'B' : 'tie',
    },
    {
      label: 'Wind',
      icon: <Wind className="h-4 w-4" />,
      valueA: formatWindSpeed(a.windSpeed),
      valueB: formatWindSpeed(b.windSpeed),
      winner: a.windSpeed < b.windSpeed ? 'A' : a.windSpeed > b.windSpeed ? 'B' : 'tie',
    },
    {
      label: 'Visibility',
      icon: <Eye className="h-4 w-4" />,
      valueA: formatVisibility(a.visibility),
      valueB: formatVisibility(b.visibility),
      winner: a.visibility > b.visibility ? 'A' : a.visibility < b.visibility ? 'B' : 'tie',
    },
    {
      label: 'Cloud Cover',
      icon: <Cloud className="h-4 w-4" />,
      valueA: formatPercent(a.cloudCoverage),
      valueB: formatPercent(b.cloudCoverage),
      winner:
        a.cloudCoverage < b.cloudCoverage ? 'A' : a.cloudCoverage > b.cloudCoverage ? 'B' : 'tie',
    },
  ];

  if (a.airQualityIndex !== undefined && b.airQualityIndex !== undefined) {
    rows.push({
      label: 'Air Quality',
      icon: <Wind className="h-4 w-4" />,
      valueA: AQI_LABELS[a.airQualityIndex - 1] || 'N/A',
      valueB: AQI_LABELS[b.airQualityIndex - 1] || 'N/A',
      winner:
        a.airQualityIndex < b.airQualityIndex
          ? 'A'
          : a.airQualityIndex > b.airQualityIndex
            ? 'B'
            : 'tie',
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-[1fr_auto_1fr] text-sm">
          {/* Header */}
          <div className="p-3 font-semibold text-center bg-muted/50 border-b">
            {a.location.city}
          </div>
          <div className="p-3 font-semibold text-center bg-muted/50 border-b border-x">
            <ArrowLeftRight className="h-4 w-4 mx-auto" />
          </div>
          <div className="p-3 font-semibold text-center bg-muted/50 border-b">
            {b.location.city}
          </div>

          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div
                className={`p-3 text-center border-b ${row.winner === 'A' ? 'bg-green-50 dark:bg-green-950/20 font-semibold' : ''}`}
              >
                {row.valueA}
              </div>
              <div className="p-3 text-center border-b border-x text-muted-foreground">
                <div className="flex items-center justify-center gap-1.5">
                  {row.icon}
                  <span className="text-xs">{row.label}</span>
                </div>
              </div>
              <div
                className={`p-3 text-center border-b ${row.winner === 'B' ? 'bg-green-50 dark:bg-green-950/20 font-semibold' : ''}`}
              >
                {row.valueB}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
