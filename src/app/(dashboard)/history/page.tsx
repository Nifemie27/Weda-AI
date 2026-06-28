import type { Metadata } from 'next';
import { SearchHistory } from '@/features/search/components/search-history';

export const metadata: Metadata = {
  title: 'Search History',
  description: 'View and manage your weather search history.',
};

export default function HistoryPage() {
  return <SearchHistory />;
}
