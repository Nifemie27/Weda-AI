'use client';

import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTripSchema, type CreateTripInput } from '@/lib/validators';
import type { Trip } from '@/generated/prisma/client';

interface TripFormProps {
  trip?: Trip;
  onSubmit: (data: CreateTripInput) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function TripForm({ trip, onSubmit, onCancel, isPending }: TripFormProps) {
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

  const status = trip?.status;

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data as CreateTripInput);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold">{trip ? 'Edit Trip' : 'Plan a New Trip'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                {...register('destination')}
                placeholder="e.g. Paris, France"
              />
              {errors.destination && (
                <p className="text-xs text-destructive">{errors.destination.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} placeholder="Paris" />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} placeholder="France" />
              {errors.country && (
                <p className="text-xs text-destructive">{errors.country.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register('latitude', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register('longitude', { valueAsNumber: true })}
                />
              </div>
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
              <Select
                value={watch('isFavourite') ? 'true' : 'false'}
                defaultValue={status}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
