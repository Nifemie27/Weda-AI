'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Droplets, Wind } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ForecastDay } from '../types';
import { getWeatherIconUrl, formatTemperature, formatWindSpeed, formatDate } from '../utils';

interface ForecastCardsProps {
  forecast: ForecastDay[];
}

export function ForecastCards({ forecast }: ForecastCardsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {forecast.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <Card className="h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <p className="text-sm font-medium">
                  {index === 0 ? 'Today' : formatDate(day.date)}
                </p>
                <Image
                  src={getWeatherIconUrl(day.conditionIcon, '2x')}
                  alt={day.conditionDescription}
                  width={64}
                  height={64}
                  className="my-1"
                  unoptimized
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">{formatTemperature(day.tempHigh)}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTemperature(day.tempLow)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground capitalize mb-3">
                  {day.conditionDescription}
                </p>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {day.rainChance}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {formatWindSpeed(day.windSpeed)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{day.summary}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
