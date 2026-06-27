'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delay={300}>{children}</TooltipProvider>
    </QueryProvider>
  );
}
