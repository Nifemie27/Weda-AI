'use client';

import { useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Star, Pencil, CloudSun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeather } from '@/features/weather/hooks/use-weather';
import { CurrentWeather } from '@/features/weather/components/current-weather';
import { ForecastCards } from '@/features/weather/components/forecast-cards';
import { WeatherInsights } from '@/features/weather/components/weather-insights';
import { HealthAdvisor } from '@/features/travel/components/health-advisor';
import { PackingChecklist } from '@/features/packing/components/packing-checklist';
import { LocationMap } from '@/features/weather/components/location-map';
import { useInsights } from '@/features/weather/hooks/use-insights';
import type { Trip } from '@/generated/prisma/client';

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

interface TripDetailProps {
  trip: Trip;
  onBack: () => void;
  onEdit: () => void;
}

export function TripDetail({ trip, onBack, onEdit }: TripDetailProps) {
  const { data: weatherData, isLoading: weatherLoading } = useWeather(
    trip.city,
    trip.latitude,
    trip.longitude
  );

  const { data: insightsData, isLoading: insightsLoading } = useInsights(
    trip.city,
    trip.latitude,
    trip.longitude
  );

  const tripDuration = useMemo(
    () => differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1,
    [trip.startDate, trip.endDate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to trips">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{trip.destination}</h1>
              {trip.isFavourite && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
              <Badge className={statusColors[trip.status] || ''}>
                {trip.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.city}, {trip.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(trip.startDate), 'MMM d')} –{' '}
                {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
              <span>{tripDuration} days</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>

      {/* Notes */}
      {(trip.notes || trip.packingNotes) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trip.notes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">Trip Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trip.notes}</p>
              </CardContent>
            </Card>
          )}
          {trip.packingNotes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">Packing Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {trip.packingNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Weather and advice */}
      {weatherLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-lg" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      ) : weatherData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="weather">
            <TabsList className="mb-6">
              <TabsTrigger value="weather">Weather</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="travel">Travel Advice</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="packing">Packing</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="weather">
              <CurrentWeather data={weatherData.current} />
            </TabsContent>

            <TabsContent value="forecast">
              <ForecastCards forecast={weatherData.forecast} />
            </TabsContent>

            <TabsContent value="travel">
              {insightsLoading ? (
                <Skeleton className="h-64 rounded-lg" />
              ) : insightsData ? (
                <WeatherInsights
                  summary={insightsData.summary}
                  insights={insightsData.insights}
                  travelConditions={insightsData.travelConditions}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="health">
              <HealthAdvisor current={weatherData.current} forecast={weatherData.forecast} />
            </TabsContent>

            <TabsContent value="packing">
              <PackingChecklist
                current={weatherData.current}
                forecast={weatherData.forecast}
                tripDuration={tripDuration}
              />
            </TabsContent>

            <TabsContent value="map">
              <LocationMap latitude={trip.latitude} longitude={trip.longitude} city={trip.city} />
            </TabsContent>
          </Tabs>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CloudSun className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">Weather data unavailable</p>
            <p className="text-sm text-muted-foreground mt-1">
              Unable to load weather for {trip.city}. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
