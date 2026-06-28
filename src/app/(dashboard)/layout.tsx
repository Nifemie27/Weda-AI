'use client';

import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import { WeatherBackground } from '@/components/common/weather-background';
import { useWeatherBg } from '@/providers/weather-bg-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { condition, isDay } = useWeatherBg();

  return (
    <WeatherBackground condition={condition || undefined} isDay={isDay}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </WeatherBackground>
  );
}
