import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { APP_NAME, DEVELOPER_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Wéda Weather and PM Accelerator.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-2">AI-powered Weather & Travel Assistant</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">About This Project</h2>
          <p className="text-muted-foreground leading-relaxed">
            {APP_NAME} is an AI-powered weather and travel assistant designed to help travellers
            make informed decisions. Rather than simply displaying weather data, it answers the
            question: &ldquo;What should I know before travelling here?&rdquo;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The application provides real-time weather data, 5-day forecasts, air quality
            information, AI-generated travel insights, smart packing recommendations, destination
            comparisons, and trip planning — all grounded in live weather and environmental data.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Built with Next.js, TypeScript, Tailwind CSS, Prisma, and Supabase PostgreSQL. Weather
            data is sourced from OpenWeatherMap APIs.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">About PM Accelerator</h2>
          <p className="text-muted-foreground leading-relaxed">
            PM Accelerator is a professional development platform that helps aspiring and current
            product managers accelerate their careers. The programme connects participants with
            experienced mentors, hands-on projects, and a community of like-minded professionals to
            build practical skills that translate directly to real product management roles.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Through structured learning paths, real-world project experience, and personalised
            mentorship, PM Accelerator bridges the gap between theoretical knowledge and the
            practical expertise that hiring managers look for. The programme emphasises
            cross-functional collaboration, data-driven decision making, and the ability to deliver
            meaningful products that solve genuine user problems.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Developer</h2>
          <p className="text-muted-foreground leading-relaxed">
            Designed and built by <strong>{DEVELOPER_NAME}</strong> as part of the PM Accelerator AI
            Engineering programme.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
