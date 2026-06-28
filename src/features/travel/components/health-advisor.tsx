'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CurrentWeather, ForecastDay } from '@/features/weather/types';
import { generateHealthAdvice, type HealthAdvice } from '../services/health-advisor';

interface HealthAdvisorProps {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

const severityStyles = {
  info: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
  caution: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
  warning: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
};

export function HealthAdvisor({ current, forecast }: HealthAdvisorProps) {
  const advice = useMemo(() => generateHealthAdvice(current, forecast), [current, forecast]);

  if (advice.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-medium">No health concerns</p>
          <p className="text-sm text-muted-foreground mt-1">
            Current conditions are safe for all activities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Travel Health Advisor</h3>
      <div className="space-y-3">
        {advice.map((item: HealthAdvice, index: number) => (
          <motion.div
            key={`${item.category}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card className={`border-l-4 ${severityStyles[item.severity]}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
