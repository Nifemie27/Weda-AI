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
import { Badge } from '@/components/ui/badge';
import { LocalTime } from './local-time';
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center"
    >
      {/* City + condition */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold tracking-tight">{data.location.city}</h2>
        <LocalTime
          timezoneOffset={data.timezone}
          className="justify-center text-sm text-foreground/50 mt-0.5"
        />
      </motion.div>

      {/* Giant temperature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="my-2"
      >
        <span className="text-7xl sm:text-[8rem] font-extralight leading-none tracking-tighter">
          {Math.round(data.temperature)}°
        </span>
      </motion.div>

      {/* Condition + H/L */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-1 mb-8"
      >
        <div className="flex items-center justify-center gap-2">
          <Image
            src={getWeatherIconUrl(data.conditionIcon, '2x')}
            alt={data.conditionDescription}
            width={32}
            height={32}
            className="drop-shadow-sm"
            unoptimized
          />
          <p className="text-foreground/70 capitalize font-medium">{data.conditionDescription}</p>
        </div>
        <p className="text-foreground/50 text-sm">
          H:{Math.round(data.tempMax)}° L:{Math.round(data.tempMin)}° · Feels like{' '}
          {Math.round(data.feelsLike)}°
        </p>
      </motion.div>

      {/* Detail modules - Apple style 2x grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-lg mx-auto"
      >
        <AppleModule
          icon={<Wind className="h-4 w-4" />}
          title="WIND"
          value={formatWindSpeed(data.windSpeed)}
          subtitle={getWindDirection(data.windDeg)}
        />
        <AppleModule
          icon={<Droplets className="h-4 w-4" />}
          title="HUMIDITY"
          value={formatPercent(data.humidity)}
        />
        <AppleModule
          icon={<Thermometer className="h-4 w-4" />}
          title="FEELS LIKE"
          value={formatTemperature(data.feelsLike)}
        />
        <AppleModule
          icon={<Eye className="h-4 w-4" />}
          title="VISIBILITY"
          value={formatVisibility(data.visibility)}
        />
        <AppleModule
          icon={<Gauge className="h-4 w-4" />}
          title="PRESSURE"
          value={formatPressure(data.pressure)}
        />
        <AppleModule
          icon={<CloudRain className="h-4 w-4" />}
          title="CLOUD COVER"
          value={formatPercent(data.cloudCoverage)}
        />
        <AppleModule
          icon={<Sunrise className="h-4 w-4" />}
          title="SUNRISE"
          value={formatTime(data.sunrise, data.timezone)}
        />
        <AppleModule
          icon={<Sunset className="h-4 w-4" />}
          title="SUNSET"
          value={formatTime(data.sunset, data.timezone)}
        />
        {data.airQualityIndex !== undefined && (
          <AppleModule
            icon={<Wind className="h-4 w-4" />}
            title="AIR QUALITY"
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
          <AppleModule
            icon={<CloudRain className="h-4 w-4" />}
            title="RAINFALL"
            value={`${data.rain1h} mm`}
            subtitle="Last hour"
          />
        )}
        {data.snow1h !== undefined && data.snow1h > 0 && (
          <AppleModule
            icon={<Snowflake className="h-4 w-4" />}
            title="SNOWFALL"
            value={`${data.snow1h} mm`}
            subtitle="Last hour"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function AppleModule({
  icon,
  title,
  value,
  subtitle,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  badge?: 'default' | 'secondary' | 'destructive';
}) {
  return (
    <div className="rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-md p-4 text-left">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-foreground/40">{icon}</span>
        <span className="text-[10px] font-semibold tracking-widest text-foreground/40">
          {title}
        </span>
      </div>
      {badge ? (
        <Badge variant={badge} className="text-sm font-semibold">
          {value}
        </Badge>
      ) : (
        <p className="text-xl font-semibold">{value}</p>
      )}
      {subtitle && <p className="text-xs text-foreground/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}
