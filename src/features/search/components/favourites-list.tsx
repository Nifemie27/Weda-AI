'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Star, Trash2, MapPin, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavourites, useDeleteFavourite } from '../hooks/use-favourites';

interface FavouritesListProps {
  onSelect?: (city: string, lat: number, lon: number) => void;
}

export function FavouritesList({ onSelect }: FavouritesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useFavourites(searchQuery || undefined);
  const deleteFavourite = useDeleteFavourite();

  const favourites = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favourites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium text-sm">No favourite locations</p>
            <p className="text-xs text-muted-foreground mt-1">
              Save locations from the weather dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {favourites.map((fav) => (
              <motion.div
                key={fav.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Card
                  className={onSelect ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <button
                      type="button"
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                      onClick={() => onSelect?.(fav.city, fav.latitude, fav.longitude)}
                      disabled={!onSelect}
                    >
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fav.nickname || fav.city}, {fav.country}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fav.state ? `${fav.state} · ` : ''}
                          Added {format(new Date(fav.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFavourite.mutate(fav.id);
                      }}
                      disabled={deleteFavourite.isPending}
                      aria-label={`Remove ${fav.city} from favourites`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
