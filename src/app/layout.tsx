import type { Metadata } from 'next';
import { Poppins, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/providers';
import './globals.css';

const poppins = Poppins({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Wéda AI — Weather & Travel Assistant',
    template: '%s | Wéda AI',
  },
  description:
    'AI-powered Weather & Travel Assistant. Get real-time weather data, travel insights, packing recommendations, and destination comparisons.',
  keywords: ['weather', 'travel', 'AI', 'forecast', 'packing', 'trip planner'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
