'use client';

import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFavourites } from '../hooks/use-favourites';

interface SavedSidebarProps {
  onSelect: (city: string, lat: number, lon: number) => void;
  activeCity?: string;
}

export function SavedSidebar({ onSelect, activeCity }: SavedSidebarProps) {
  const { data } = useFavourites();
  const favourites = data?.data || [];

  if (favourites.length === 0) return null;

  return (
    <div className="hidden xl:block absolute right-4 top-0 w-60 z-10">
      <div className="sticky top-20">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-semibold tracking-widest text-foreground/40 uppercase">
            Saved
          </span>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1 pl-2">
            {favourites.map((fav, index) => (
              <motion.button
                key={fav.id}
                type="button"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(fav.city, fav.latitude, fav.longitude)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all duration-200 ${
                  activeCity === fav.city
                    ? 'bg-white/25 dark:bg-white/10 shadow-md'
                    : 'hover:bg-white/15 dark:hover:bg-white/5'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{fav.nickname || fav.city}</p>
                  <p className="text-[11px] text-foreground/50 truncate">{fav.country}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
