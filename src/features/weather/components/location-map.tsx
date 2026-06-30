'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/common/error-display';
import { useTheme } from '@/providers/theme-provider';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function LocationMap({ latitude, longitude, city, className }: LocationMapProps) {
  if (MAPBOX_TOKEN) {
    return (
      <MapboxMap latitude={latitude} longitude={longitude} city={city} className={className} />
    );
  }
  return <LeafletMap latitude={latitude} longitude={longitude} city={city} className={className} />;
}

function MapboxMap({ latitude, longitude, city, className }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;
    let cancelled = false;
    setError(null);
    setReady(false);

    // Wait until the container is actually visible (handles hidden tab panels)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          initMap();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    async function initMap() {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        await import('mapbox-gl/dist/mapbox-gl.css');

        if (cancelled || !mapRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN!;

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current as import('mapbox-gl').Map;
          map.flyTo({ center: [longitude, latitude], zoom: 11, duration: 800 });
          (markerRef.current as import('mapbox-gl').Marker)?.setLngLat([longitude, latitude]);
          return;
        }

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style:
            resolvedTheme === 'dark'
              ? 'mapbox://styles/mapbox/navigation-night-v1'
              : 'mapbox://styles/mapbox/streets-v12',
          center: [longitude, latitude],
          zoom: 11,
          attributionControl: false,
          // Render immediately without waiting for all tiles
          fadeDuration: 0,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }));

        const marker = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(city))
          .addTo(map);

        map.on('load', () => {
          if (!cancelled) {
            map.resize();
            setReady(true);
          }
        });

        map.on('error', () => {
          if (!cancelled) setError(new Error('Could not load the map. Please try again.'));
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch {
        if (!cancelled) setError(new Error('Could not load the map. Please try again.'));
      }
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [latitude, longitude, city, retryKey, resolvedTheme]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
        <div ref={containerRef} className="relative h-72 w-full">
          <div ref={mapRef} className="absolute inset-0 z-0" />
          {!ready && <div className="absolute inset-0 z-10 animate-pulse bg-muted" />}
        </div>
      </CardContent>
    </Card>
  );
}

function LeafletMap({ latitude, longitude, city, className }: LocationMapProps) {
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
