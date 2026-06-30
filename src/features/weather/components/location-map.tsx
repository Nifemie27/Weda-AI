'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/providers/theme-provider';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function LocationMap({ latitude, longitude, city, className }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!mapRef.current || !MAPBOX_TOKEN) return;

    // Destroy previous instance on re-render
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as { remove: () => void }).remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    setReady(false);
    setError(null);
    let cancelled = false;

    async function init() {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');
        if (cancelled || !mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN!;

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style:
            resolvedTheme === 'dark'
              ? 'mapbox://styles/mapbox/dark-v11'
              : 'mapbox://styles/mapbox/streets-v12',
          center: [longitude, latitude],
          zoom: 11,
          attributionControl: true,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setText(city))
          .addTo(map);

        map.on('load', () => {
          if (!cancelled) {
            map.resize();
            setReady(true);
          }
        });

        mapInstanceRef.current = map;
      } catch {
        if (!cancelled) setError('Could not load the map.');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // Re-init when location or theme changes
  }, [latitude, longitude, city, resolvedTheme]);

  if (!MAPBOX_TOKEN) {
    return (
      <LeafletMap latitude={latitude} longitude={longitude} city={city} className={className} />
    );
  }

  if (error) {
    return (
      <div className="h-72 flex items-center justify-center rounded-2xl bg-muted/30 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden rounded-xl">
        <div className="relative h-72 w-full">
          {!ready && <Skeleton className="absolute inset-0" />}
          <div ref={mapRef} className="h-72 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function LeafletMap({ latitude, longitude, city, className }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    async function initMap() {
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
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, city]);

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
