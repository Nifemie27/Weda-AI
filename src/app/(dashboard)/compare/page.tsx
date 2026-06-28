import type { Metadata } from 'next';
import { DestinationCompare } from '@/features/comparison/components/destination-compare';

export const metadata: Metadata = {
  title: 'Compare Destinations',
  description: 'Compare weather conditions between two destinations side by side.',
};

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <DestinationCompare />
    </div>
  );
}
