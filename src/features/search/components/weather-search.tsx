'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, X, Mailbox, Landmark, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGeocode } from '../hooks/use-geocode';
import { useGeolocation } from '@/hooks';
import type { GeocodingResult } from '@/features/weather/types';

interface WeatherSearchProps {
  onSearch: (query: string, lat?: number, lon?: number) => void;
  placeholder?: string;
}

function getPlaceIcon(placeType?: GeocodingResult['placeType']) {
  switch (placeType) {
    case 'postcode':
      return Mailbox;
    case 'poi':
      return Landmark;
    case 'address':
      return Building2;
    default:
      return MapPin;
  }
}

export function WeatherSearch({
  onSearch,
  placeholder = 'Search city, postal code, landmark, or address...',
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
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-foreground/40" />
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
          className="pl-10 sm:pl-12 pr-20 sm:pr-28 h-12 sm:h-14 text-sm sm:text-base rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-xl border-white/25 dark:border-white/10 shadow-lg shadow-black/5 focus-visible:ring-white/30 placeholder:text-foreground/30 font-medium"
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
            suggestions?.map((result, index) => {
              const Icon = getPlaceIcon(result.placeType);
              return (
                <button
                  key={`${result.latitude}-${result.longitude}-${index}`}
                  type="button"
                  role="option"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                  onClick={() => handleSelect(result)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{result.name}</span>
                    <span className="text-muted-foreground">
                      {result.state ? `, ${result.state}` : ''}
                      {result.country ? `, ${result.country}` : ''}
                    </span>
                  </div>
                  {result.placeType && result.placeType !== 'place' && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 shrink-0">
                      {result.placeType === 'postcode'
                        ? 'Postal Code'
                        : result.placeType === 'poi'
                          ? 'Landmark'
                          : result.placeType === 'address'
                            ? 'Address'
                            : result.placeType === 'region'
                              ? 'Region'
                              : result.placeType}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
