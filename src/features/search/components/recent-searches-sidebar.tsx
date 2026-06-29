'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchHistory } from '../hooks/use-search-history';
import { getWeatherIconUrl } from '@/features/weather/utils';

interface RecentSearchesSidebarProps {
  onSelect: (city: string, lat: number, lon: number) => void;
  activeCity?: string;
}

export function RecentSearchesSidebar({ onSelect, activeCity }: RecentSearchesSidebarProps) {
  const { data } = useSearchHistory({ pageSize: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const searches = data?.data || [];
  const unique = searches.filter((s, i, arr) => arr.findIndex((x) => x.city === s.city) === i);

  if (unique.length === 0) return null;

  return (
    <div className="hidden xl:block absolute left-4 top-0 w-60 z-10">
      <div className="sticky top-20">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Clock className="h-3.5 w-3.5 text-foreground/40" />
          <span className="text-[10px] font-semibold tracking-widest text-foreground/40 uppercase">
            Recent
          </span>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1 pr-2">
            {unique.map((search, index) => {
              const isActive = activeCity === search.city;
              return (
                <motion.button
                  key={search.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(search.city, search.latitude, search.longitude)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-white/25 dark:bg-white/10 shadow-md'
                      : 'hover:bg-white/15 dark:hover:bg-white/5'
                  }`}
                >
                  <Image
                    src={getWeatherIconUrl(search.conditionIcon)}
                    alt={search.condition}
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{search.city}</p>
                    <p className="text-[11px] text-foreground/50 capitalize truncate">
                      {search.condition.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-base font-semibold tabular-nums">
                    {Math.round(search.temperature)}°
                  </span>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
