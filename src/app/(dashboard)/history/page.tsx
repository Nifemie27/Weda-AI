import type { Metadata } from 'next';
import { SearchHistory } from '@/features/search/components/search-history';

export const metadata: Metadata = {
  title: 'Search History',
  description: 'View and manage your weather search history.',
};

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <SearchHistory />
    </div>
  );
}
