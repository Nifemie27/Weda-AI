'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, CloudRain, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ForecastDay } from '../types';
import {
  getWeatherIconUrl,
  formatTemperature,
  formatWindSpeed,
  formatDate,
  formatPercent,
} from '../utils';

interface ForecastCardsProps {
  forecast: ForecastDay[];
}

export function ForecastCards({ forecast }: ForecastCardsProps) {
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

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
            <Card
              className="h-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setSelectedDay(day)}
            >
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Forecast detail modal */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        {selectedDay && (
          <DialogContent className="max-w-md">
            <div className="flex flex-col items-center text-center p-4">
              <h3 className="text-xl font-semibold mb-1">{formatDate(selectedDay.date)}</h3>
              <Badge variant="outline" className="capitalize mb-4">
                {selectedDay.conditionDescription}
              </Badge>

              <Image
                src={getWeatherIconUrl(selectedDay.conditionIcon, '4x')}
                alt={selectedDay.conditionDescription}
                width={100}
                height={100}
                className="mb-4"
                unoptimized
              />

              <div className="grid grid-cols-2 gap-4 w-full text-left">
                <DetailRow
                  icon={<Thermometer className="h-4 w-4" />}
                  label="High"
                  value={formatTemperature(selectedDay.tempHigh)}
                />
                <DetailRow
                  icon={<Thermometer className="h-4 w-4" />}
                  label="Low"
                  value={formatTemperature(selectedDay.tempLow)}
                />
                <DetailRow
                  icon={<CloudRain className="h-4 w-4" />}
                  label="Rain Chance"
                  value={`${selectedDay.rainChance}%`}
                />
                <DetailRow
                  icon={<Droplets className="h-4 w-4" />}
                  label="Humidity"
                  value={formatPercent(selectedDay.humidity)}
                />
                <DetailRow
                  icon={<Wind className="h-4 w-4" />}
                  label="Wind"
                  value={formatWindSpeed(selectedDay.windSpeed)}
                />
                <DetailRow
                  icon={<Eye className="h-4 w-4" />}
                  label="Condition"
                  value={selectedDay.condition}
                />
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg w-full">
                <p className="text-sm text-muted-foreground">{selectedDay.summary}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
