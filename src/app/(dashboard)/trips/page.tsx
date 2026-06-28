import type { Metadata } from 'next';
import { TripsList } from '@/features/trips/components/trips-list';

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'Plan and manage your weather-aware travel itineraries.',
};

export default function TripsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TripsList />
    </div>
  );
}
