'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plane,
  Trash2,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrips, useCreateTrip, useUpdateTrip, useDeleteTrip } from '../hooks/use-trips';
import { ExportButton } from '@/features/export/components/export-button';
import { TripForm } from './trip-form';
import type { CreateTripInput, UpdateTripInput } from '@/lib/validators';
import type { Trip } from '@/generated/prisma/client';

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function TripsList() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const { data, isLoading } = useTrips({
    page,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();

  const trips = data?.data || [];
  const meta = data?.meta;

  const handleCreate = (formData: CreateTripInput) => {
    createTrip.mutate(formData, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (formData: CreateTripInput) => {
    if (!editingTrip) return;
    updateTrip.mutate(
      { id: editingTrip.id, data: formData as UpdateTripInput },
      { onSuccess: () => setEditingTrip(null) }
    );
  };

  if (showForm) {
    return (
      <TripForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
        isPending={createTrip.isPending}
      />
    );
  }

  if (editingTrip) {
    return (
      <TripForm
        trip={editingTrip}
        onSubmit={handleUpdate}
        onCancel={() => setEditingTrip(null)}
        isPending={updateTrip.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground text-sm">
            {meta ? `${meta.total} trips planned` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton exportType="TRIP_HISTORY" label="Export" />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val: string | null) => {
            setStatusFilter(val ?? 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PLANNING">Planning</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trips list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">No trips yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Plan your first trip to get weather-aware travel recommendations.
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Plan a Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{trip.destination}</p>
                        {trip.isFavourite && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                        <Badge className={`text-xs ${statusColors[trip.status] || ''}`}>
                          {trip.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(trip.startDate), 'MMM d')} –{' '}
                          {format(new Date(trip.endDate), 'MMM d, yyyy')}
                        </span>
                        <span>·</span>
                        <span>
                          {trip.city}, {trip.country}
                        </span>
                      </div>
                      {trip.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {trip.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTrip(trip)}
                        aria-label={`Edit ${trip.destination}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete trip to ${trip.destination}?`)) {
                            deleteTrip.mutate(trip.id);
                          }
                        }}
                        disabled={deleteTrip.isPending}
                        aria-label={`Delete ${trip.destination}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
