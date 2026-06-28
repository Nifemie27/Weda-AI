import type { Metadata } from 'next';
import { TripsList } from '@/features/trips/components/trips-list';

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'Plan and manage your weather-aware travel itineraries.',
};

export default function TripsPage() {
  return <TripsList />;
}
