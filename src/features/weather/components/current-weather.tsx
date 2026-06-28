'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  CloudRain,
  Snowflake,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurrentWeather as CurrentWeatherType } from '../types';
import {
  getWeatherIconUrl,
  formatTemperature,
  formatWindSpeed,
  formatVisibility,
  formatPressure,
  formatPercent,
  formatTime,
  getWindDirection,
} from '../utils';
import { AQI_LABELS } from '@/lib/constants';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Main temperature */}
            <div className="flex items-center gap-4">
              <Image
                src={getWeatherIconUrl(data.conditionIcon, '4x')}
                alt={data.conditionDescription}
                width={100}
                height={100}
                className="drop-shadow-lg"
                unoptimized
              />
              <div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                  {formatTemperature(data.temperature)}
                </h2>
                <p className="text-muted-foreground capitalize text-lg">
                  {data.conditionDescription}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Feels like {formatTemperature(data.feelsLike)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    H: {formatTemperature(data.tempMax)} L: {formatTemperature(data.tempMin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Location info */}
            <div className="text-right">
              <h3 className="text-2xl font-semibold">{data.location.city}</h3>
              <p className="text-muted-foreground">
                {data.location.state ? `${data.location.state}, ` : ''}
                {data.location.country}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.location.latitude.toFixed(4)}°, {data.location.longitude.toFixed(4)}°
              </p>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            <DetailItem
              icon={<Thermometer className="h-4 w-4" />}
              label="Feels Like"
              value={formatTemperature(data.feelsLike)}
            />
            <DetailItem
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={formatPercent(data.humidity)}
            />
            <DetailItem
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${formatWindSpeed(data.windSpeed)} ${getWindDirection(data.windDeg)}`}
            />
            <DetailItem
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={formatVisibility(data.visibility)}
            />
            <DetailItem
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={formatPressure(data.pressure)}
            />
            <DetailItem
              icon={<Sunrise className="h-4 w-4" />}
              label="Sunrise"
              value={formatTime(data.sunrise, data.timezone)}
            />
            <DetailItem
              icon={<Sunset className="h-4 w-4" />}
              label="Sunset"
              value={formatTime(data.sunset, data.timezone)}
            />
            <DetailItem
              icon={<CloudRain className="h-4 w-4" />}
              label="Cloud Cover"
              value={formatPercent(data.cloudCoverage)}
            />
            {data.airQualityIndex !== undefined && (
              <DetailItem
                icon={<Wind className="h-4 w-4" />}
                label="Air Quality"
                value={AQI_LABELS[data.airQualityIndex - 1] || 'Unknown'}
                badge={
                  data.airQualityIndex <= 2
                    ? 'default'
                    : data.airQualityIndex <= 3
                      ? 'secondary'
                      : 'destructive'
                }
              />
            )}
            {data.rain1h !== undefined && data.rain1h > 0 && (
              <DetailItem
                icon={<CloudRain className="h-4 w-4" />}
                label="Rain (1h)"
                value={`${data.rain1h} mm`}
              />
            )}
            {data.snow1h !== undefined && data.snow1h > 0 && (
              <DetailItem
                icon={<Snowflake className="h-4 w-4" />}
                label="Snow (1h)"
                value={`${data.snow1h} mm`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: 'default' | 'secondary' | 'destructive';
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {badge ? (
          <Badge variant={badge} className="mt-0.5 text-xs">
            {value}
          </Badge>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
