'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

export function LocationMap({ latitude, longitude, city, className }: LocationMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || hasError) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-6 h-64 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {!apiKey
              ? 'Map unavailable — Google Maps API key not configured.'
              : 'Failed to load map.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
          </p>
        </CardContent>
      </Card>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=11&maptype=roadmap`;

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        {!isLoaded && <Skeleton className="w-full h-64" />}
        <iframe
          title={`Map of ${city}`}
          src={src}
          width="100%"
          height="256"
          style={{ border: 0, display: isLoaded ? 'block' : 'none' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </CardContent>
    </Card>
  );
}
