'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, CloudRain, Eye, Calendar } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      {/* Apple-style forecast module */}
      <div className="rounded-2xl bg-white/15 dark:bg-white/5 backdrop-blur-md overflow-hidden max-w-lg mx-auto">
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
          <Calendar className="h-3.5 w-3.5 text-foreground/40" />
          <span className="text-[10px] font-semibold tracking-widest text-foreground/40">
            5-DAY FORECAST
          </span>
        </div>

        {forecast.map((day, index) => (
          <div key={day.date}>
            {index > 0 && <div className="mx-4 h-px bg-white/10" />}
            <button
              type="button"
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-white/10 transition-colors"
              onClick={() => setSelectedDay(day)}
            >
              <span className="text-sm font-semibold w-12 text-left">
                {index === 0 ? 'Today' : formatDate(day.date).split(',')[0]}
              </span>
              <Image
                src={getWeatherIconUrl(day.conditionIcon)}
                alt={day.conditionDescription}
                width={28}
                height={28}
                unoptimized
              />
              {day.rainChance > 0 && (
                <span className="text-xs font-semibold text-blue-400 w-8">{day.rainChance}%</span>
              )}
              {day.rainChance === 0 && <span className="w-8" />}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-foreground/40 w-8 text-right">
                  {Math.round(day.tempLow)}°
                </span>
                <div className="flex-1 h-1 rounded-full bg-white/10 relative overflow-hidden">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-400"
                    style={{
                      left: `${Math.max(0, ((day.tempLow + 10) / 50) * 100)}%`,
                      right: `${Math.max(0, 100 - ((day.tempHigh + 10) / 50) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-8">{Math.round(day.tempHigh)}°</span>
              </div>
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        {selectedDay && (
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center text-center p-4">
              <h3 className="text-xl font-semibold mb-1">{formatDate(selectedDay.date)}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-4">
                {selectedDay.conditionDescription}
              </p>
              <Image
                src={getWeatherIconUrl(selectedDay.conditionIcon, '4x')}
                alt={selectedDay.conditionDescription}
                width={80}
                height={80}
                className="mb-4"
                unoptimized
              />
              <div className="grid grid-cols-2 gap-2.5 w-full text-left">
                <MiniDetail
                  icon={<Thermometer className="h-3.5 w-3.5" />}
                  label="High"
                  value={formatTemperature(selectedDay.tempHigh)}
                />
                <MiniDetail
                  icon={<Thermometer className="h-3.5 w-3.5" />}
                  label="Low"
                  value={formatTemperature(selectedDay.tempLow)}
                />
                <MiniDetail
                  icon={<CloudRain className="h-3.5 w-3.5" />}
                  label="Rain"
                  value={`${selectedDay.rainChance}%`}
                />
                <MiniDetail
                  icon={<Droplets className="h-3.5 w-3.5" />}
                  label="Humidity"
                  value={formatPercent(selectedDay.humidity)}
                />
                <MiniDetail
                  icon={<Wind className="h-3.5 w-3.5" />}
                  label="Wind"
                  value={formatWindSpeed(selectedDay.windSpeed)}
                />
                <MiniDetail
                  icon={<Eye className="h-3.5 w-3.5" />}
                  label="Condition"
                  value={selectedDay.condition}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 w-full">
                {selectedDay.summary}
              </p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
}

function MiniDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
