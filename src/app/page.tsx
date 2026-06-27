import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import { Cloud, MapPin, Plane, PackageCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const features = [
  {
    icon: Cloud,
    title: 'Real-Time Weather',
    description: 'Current conditions, 5-day forecasts, air quality, and UV index from live data.',
  },
  {
    icon: MapPin,
    title: 'Destination Insights',
    description:
      'Maps, travel videos, local time, and AI-powered recommendations for any location.',
  },
  {
    icon: Plane,
    title: 'Trip Planner',
    description:
      'Plan trips with weather-aware scheduling, save favourites, and compare destinations.',
  },
  {
    icon: PackageCheck,
    title: 'Smart Packing',
    description: 'AI-generated packing lists based on weather, duration, and destination.',
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{APP_NAME}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {APP_DESCRIPTION}
          </p>
          <p className="text-muted-foreground mb-12">Search any destination to get started.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="text-left">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
