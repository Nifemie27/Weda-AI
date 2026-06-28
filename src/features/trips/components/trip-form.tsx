'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { MapPin, Loader2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks';
import { createTripSchema, type CreateTripInput } from '@/lib/validators';
import type { Trip } from '@/generated/prisma/client';
import type { GeocodingResult } from '@/features/weather/types';

interface TripFormProps {
  trip?: Trip;
  onSubmit: (data: CreateTripInput) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function TripForm({ trip, onSubmit, onCancel, isPending }: TripFormProps) {
  const [destinationInput, setDestinationInput] = useState(trip?.destination || '');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationResolved, setLocationResolved] = useState(!!trip);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedDestination = useDebounce(destinationInput, 400);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: trip
      ? {
          destination: trip.destination,
          city: trip.city,
          country: trip.country,
          latitude: trip.latitude,
          longitude: trip.longitude,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          notes: trip.notes || '',
          packingNotes: trip.packingNotes || '',
          isFavourite: trip.isFavourite,
        }
      : {
          destination: '',
          city: '',
          country: '',
          latitude: 0,
          longitude: 0,
          startDate: new Date(),
          endDate: new Date(),
          notes: '',
          packingNotes: '',
          isFavourite: false,
        },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  useEffect(() => {
    if (debouncedDestination.length < 2 || locationResolved) {
      setSuggestions([]);
      return;
    }

    setGeocoding(true);
    fetch(`/api/geocode?q=${encodeURIComponent(debouncedDestination)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSuggestions(json.data);
          setShowSuggestions(json.data.length > 0);
        }
      })
      .catch(() => {})
      .finally(() => setGeocoding(false));
  }, [debouncedDestination, locationResolved]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = useCallback(
    (result: GeocodingResult) => {
      setDestinationInput(result.displayName);
      setValue('destination', result.displayName);
      setValue('city', result.name);
      setValue('country', result.country);
      setValue('latitude', result.latitude);
      setValue('longitude', result.longitude);
      setLocationResolved(true);
      setShowSuggestions(false);
      setSuggestions([]);
    },
    [setValue]
  );

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data as CreateTripInput);
  };

  const status = trip?.status;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold">{trip ? 'Edit Trip' : 'Plan a New Trip'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination with autocomplete */}
            <div className="space-y-2 md:col-span-2" ref={containerRef}>
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="destination"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setLocationResolved(false);
                    setValue('destination', e.target.value);
                  }}
                  placeholder="Start typing a city name..."
                  className="pl-10 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {geocoding && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {locationResolved && !geocoding && <Check className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination.message}</p>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-w-lg rounded-md border bg-popover shadow-lg">
                  {suggestions.map((result, index) => (
                    <button
                      key={`${result.latitude}-${result.longitude}-${index}`}
                      type="button"
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                      onClick={() => handleSelectLocation(result)}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{result.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
              {locationResolved && (
                <p className="text-xs text-muted-foreground">
                  {watch('city')}, {watch('country')} — {Number(latitude).toFixed(4)}°,{' '}
                  {Number(longitude).toFixed(4)}°
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                defaultValue={
                  trip
                    ? format(new Date(trip.startDate), 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd')
                }
                onChange={(e) => setValue('startDate', new Date(e.target.value))}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                defaultValue={
                  trip
                    ? format(new Date(trip.endDate), 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd')
                }
                onChange={(e) => setValue('endDate', new Date(e.target.value))}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {trip && (
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                disabled
                className="w-full h-9 rounded-md border bg-background px-3 text-sm disabled:opacity-50"
              >
                <option value="PLANNING">Planning</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Trip Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any notes about your trip..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packingNotes">Packing Notes</Label>
            <Textarea
              id="packingNotes"
              {...register('packingNotes')}
              placeholder="Items to pack, reminders..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('isFavourite')} className="rounded" />
              Mark as favourite
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || (!locationResolved && !trip)}>
              {isPending ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
