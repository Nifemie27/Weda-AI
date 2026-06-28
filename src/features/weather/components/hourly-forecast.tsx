'use client';

import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { HourlyForecast as HourlyForecastType } from '../types';
import { getWeatherIconUrl, formatTemperature } from '../utils';

interface HourlyForecastProps {
  hourly: HourlyForecastType[];
  timezone: number;
}

function formatHour(isoString: string, timezoneOffset: number): string {
  const date = new Date(isoString);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const local = new Date(utc + timezoneOffset * 1000);
  return local.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function HourlyForecast({ hourly, timezone }: HourlyForecastProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
      <div className="rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
        <div className="p-4">
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-2">
              {hourly.slice(0, 24).map((hour, index) => (
                <div key={hour.time} className="flex flex-col items-center gap-1 min-w-[64px]">
                  <span className="text-xs text-muted-foreground">
                    {index === 0 ? 'Now' : formatHour(hour.time, timezone)}
                  </span>
                  <Image
                    src={getWeatherIconUrl(hour.conditionIcon)}
                    alt={hour.condition}
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <span className="text-sm font-medium">{formatTemperature(hour.temperature)}</span>
                  {hour.rainChance > 0 && (
                    <span className="text-xs text-blue-500">{hour.rainChance}%</span>
                  )}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
