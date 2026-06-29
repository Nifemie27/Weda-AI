'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { HourlyForecast as HourlyForecastType } from '../types';
import { getWeatherIconUrl } from '../utils';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <div className="rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
          <Clock className="h-3.5 w-3.5 text-foreground/40" />
          <span className="text-[10px] font-semibold tracking-widest text-foreground/40">
            HOURLY FORECAST
          </span>
        </div>
        <div className="px-2 pb-3">
          <ScrollArea className="w-full">
            <div className="flex gap-0 py-2">
              {hourly.slice(0, 24).map((hour, index) => (
                <div key={hour.time} className="flex flex-col items-center gap-1 min-w-[56px] py-2">
                  <span className="text-[11px] font-medium text-foreground/50">
                    {index === 0 ? 'Now' : formatHour(hour.time, timezone)}
                  </span>
                  <Image
                    src={getWeatherIconUrl(hour.conditionIcon)}
                    alt={hour.condition}
                    width={32}
                    height={32}
                    unoptimized
                  />
                  {hour.rainChance > 0 && (
                    <span className="text-[10px] font-semibold text-blue-400">
                      {hour.rainChance}%
                    </span>
                  )}
                  <span className="text-sm font-semibold">{Math.round(hour.temperature)}°</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}
