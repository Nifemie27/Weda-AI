'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddFavourite } from '@/features/search/hooks/use-favourites';
import type { CurrentWeather } from '../types';

interface SaveFavouriteButtonProps {
  weather: CurrentWeather;
}

export function SaveFavouriteButton({ weather }: SaveFavouriteButtonProps) {
  const addFavourite = useAddFavourite();

  const handleSave = () => {
    addFavourite.mutate({
      city: weather.location.city,
      country: weather.location.country,
      state: weather.location.state,
      latitude: weather.location.latitude,
      longitude: weather.location.longitude,
      lastWeatherSnapshot: {
        temperature: weather.temperature,
        condition: weather.condition,
        conditionIcon: weather.conditionIcon,
        savedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={addFavourite.isPending}
      className="gap-1.5"
    >
      <Star
        className={`h-4 w-4 ${addFavourite.isSuccess ? 'fill-amber-500 text-amber-500' : ''}`}
      />
      {addFavourite.isSuccess ? 'Saved' : addFavourite.isPending ? 'Saving...' : 'Save Location'}
    </Button>
  );
}
