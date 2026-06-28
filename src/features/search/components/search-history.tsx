'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Search, ChevronLeft, ChevronRight, CloudSun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchHistory, useDeleteSearch, useClearHistory } from '../hooks/use-search-history';
import { ExportButton } from '@/features/export/components/export-button';
import { formatTemperature } from '@/features/weather/utils';

export function SearchHistory() {
  const [page, setPage] = useState(1);
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data, isLoading } = useSearchHistory({
    page,
    pageSize: 10,
    sortBy,
    sortOrder,
    city: cityFilter || undefined,
  });

  const router = useRouter();
  const deleteSearch = useDeleteSearch();
  const clearHistory = useClearHistory();

  const searches = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search History</h1>
          <p className="text-muted-foreground text-sm">
            {meta ? `${meta.total} searches recorded` : 'Loading...'}
          </p>
        </div>
        {searches.length > 0 && (
          <div className="flex items-center gap-2">
            <ExportButton exportType="SEARCH_HISTORY" label="Export" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Clear all search history? This cannot be undone.')) {
                  clearHistory.mutate();
                }
              }}
              disabled={clearHistory.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="createdAt">Sort by Date</option>
          <option value="city">Sort by City</option>
          <option value="temperature">Sort by Temperature</option>
        </select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CloudSun className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium">No search history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Search for a location on the dashboard to start building your history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {searches.map((search) => (
              <motion.div
                key={search.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() =>
                    router.push(
                      `/weather?lat=${search.latitude}&lon=${search.longitude}&q=${encodeURIComponent(search.city)}`
                    )
                  }
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {search.city}, {search.country}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {formatTemperature(search.temperature)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize">{search.condition.toLowerCase()}</span>
                          <span>·</span>
                          <span>Humidity {search.humidity}%</span>
                          <span>·</span>
                          <span>
                            {(() => {
                              try {
                                return format(new Date(search.createdAt), 'MMM d, yyyy h:mm a');
                              } catch {
                                return 'Unknown date';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearch.mutate(search.id);
                      }}
                      disabled={deleteSearch.isPending}
                      aria-label={`Delete search for ${search.city}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
