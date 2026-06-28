import type { Metadata } from 'next';
import { WeatherDashboard } from '@/features/weather/components';

export const metadata: Metadata = {
  title: 'Weather Dashboard',
  description: 'Search any location for real-time weather, forecasts, and AI travel insights.',
};

export default function WeatherPage() {
  return <WeatherDashboard />;
}
