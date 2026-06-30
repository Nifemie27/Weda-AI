'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/common/error-display';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

export function LocationMap({ latitude, longitude, city, className }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    setError(null);

    async function initMap() {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (cancelled || !mapRef.current) return;

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current as L.Map;
          map.setView([latitude, longitude], 12);
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
          });
          L.marker([latitude, longitude]).addTo(map).bindPopup(city).openPopup();
          return;
        }

        const map = L.map(mapRef.current).setView([latitude, longitude], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(city).openPopup();

        mapInstanceRef.current = map;
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(new Error('Could not load the map. Please try again.'));
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, city, retryKey]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <ErrorDisplay error={error} onRetry={() => setRetryKey((k) => k + 1)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        {!ready && <Skeleton className="w-full h-72" />}
        <div
          ref={mapRef}
          className="h-72 w-full z-0"
          style={{ display: ready ? 'block' : 'none' }}
        />
      </CardContent>
    </Card>
  );
}
