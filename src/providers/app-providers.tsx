'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { WeatherBgProvider } from './weather-bg-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <WeatherBgProvider>
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </WeatherBgProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
