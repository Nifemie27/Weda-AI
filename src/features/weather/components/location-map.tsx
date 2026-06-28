'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

export function LocationMap({ latitude, longitude, city, className }: LocationMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const src = googleKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleKey}&q=${latitude},${longitude}&zoom=11&maptype=roadmap`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05},${latitude - 0.03},${longitude + 0.05},${latitude + 0.03}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        {!isLoaded && <Skeleton className="w-full h-72" />}
        <iframe
          title={`Map of ${city}`}
          src={src}
          width="100%"
          height="288"
          style={{ border: 0, display: isLoaded ? 'block' : 'none' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoaded(true)}
        />
      </CardContent>
    </Card>
  );
}
