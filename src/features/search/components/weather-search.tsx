'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGeocode } from '../hooks/use-geocode';
import { useGeolocation } from '@/hooks';
import type { GeocodingResult } from '@/features/weather/types';

interface WeatherSearchProps {
  onSearch: (query: string, lat?: number, lon?: number) => void;
  placeholder?: string;
}

export function WeatherSearch({
  onSearch,
  placeholder = 'Search city, town, postal code, or coordinates...',
}: WeatherSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: suggestions, isLoading: isSearching } = useGeocode(inputValue);
  const { latitude, longitude, loading: geoLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      onSearch(`${latitude.toFixed(4)},${longitude.toFixed(4)}`, latitude, longitude);
    }
  }, [latitude, longitude, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      setInputValue(result.displayName);
      setIsOpen(false);
      onSearch(result.displayName, result.latitude, result.longitude);
    },
    [onSearch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        setIsOpen(false);
        onSearch(inputValue.trim());
      }
    },
    [inputValue, onSearch]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (inputValue.length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-10 pr-24 h-12 text-base bg-white/40 dark:bg-black/20 backdrop-blur-md border-white/30 dark:border-white/10"
          aria-label="Search for a location"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={requestLocation}
            disabled={geoLoading}
            aria-label="Use current location"
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
          <Button type="submit" size="sm" className="h-8" disabled={!inputValue.trim()}>
            Search
          </Button>
        </div>
      </form>

      {isOpen && (suggestions?.length || isSearching) && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-xl shadow-lg"
          role="listbox"
        >
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : (
            suggestions?.map((result, index) => (
              <button
                key={`${result.latitude}-${result.longitude}-${index}`}
                type="button"
                role="option"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                onClick={() => handleSelect(result)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="font-medium">{result.name}</span>
                  <span className="text-muted-foreground">
                    {result.state ? `, ${result.state}` : ''}, {result.country}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
