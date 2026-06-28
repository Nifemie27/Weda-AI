import { describe, it, expect } from 'vitest';
import {
  weatherSearchQuerySchema,
  createTripSchema,
  createFavouriteSchema,
  exportRequestSchema,
  createComparisonSchema,
} from '@/lib/validators';

describe('weatherSearchQuerySchema', () => {
  it('accepts city name query', () => {
    const result = weatherSearchQuerySchema.safeParse({ q: 'London' });
    expect(result.success).toBe(true);
  });

  it('accepts lat/lon coordinates', () => {
    const result = weatherSearchQuerySchema.safeParse({ lat: '51.5', lon: '-0.12' });
    expect(result.success).toBe(true);
  });

  it('accepts zip code', () => {
    const result = weatherSearchQuerySchema.safeParse({ zip: '10001' });
    expect(result.success).toBe(true);
  });

  it('rejects empty query', () => {
    const result = weatherSearchQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects lat without lon', () => {
    const result = weatherSearchQuerySchema.safeParse({ lat: '51.5' });
    expect(result.success).toBe(false);
  });

  it('rejects out-of-range latitude', () => {
    const result = weatherSearchQuerySchema.safeParse({ lat: '95', lon: '0' });
    expect(result.success).toBe(false);
  });
});

describe('createTripSchema', () => {
  const validTrip = {
    destination: 'Paris, France',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    startDate: '2026-07-01',
    endDate: '2026-07-05',
  };

  it('accepts valid trip', () => {
    const result = createTripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
  });

  it('rejects missing destination', () => {
    const result = createTripSchema.safeParse({ ...validTrip, destination: '' });
    expect(result.success).toBe(false);
  });

  it('rejects end date before start date', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      startDate: '2026-07-05',
      endDate: '2026-07-01',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional notes', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      notes: 'Pack sunscreen',
      packingNotes: 'Umbrella',
    });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding max length', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      notes: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe('createFavouriteSchema', () => {
  it('accepts valid favourite', () => {
    const result = createFavouriteSchema.safeParse({
      city: 'Tokyo',
      country: 'JP',
      latitude: 35.6762,
      longitude: 139.6503,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing city', () => {
    const result = createFavouriteSchema.safeParse({
      city: '',
      country: 'JP',
      latitude: 35,
      longitude: 139,
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional nickname', () => {
    const result = createFavouriteSchema.safeParse({
      city: 'Tokyo',
      country: 'JP',
      latitude: 35,
      longitude: 139,
      nickname: 'Home base',
    });
    expect(result.success).toBe(true);
  });
});

describe('exportRequestSchema', () => {
  it('accepts valid export request', () => {
    const result = exportRequestSchema.safeParse({
      format: 'JSON',
      exportType: 'SEARCH_HISTORY',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid format', () => {
    const result = exportRequestSchema.safeParse({
      format: 'XML',
      exportType: 'SEARCH_HISTORY',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional recordId', () => {
    const result = exportRequestSchema.safeParse({
      format: 'PDF',
      exportType: 'TRIP',
      recordId: 'abc123',
    });
    expect(result.success).toBe(true);
  });
});

describe('createComparisonSchema', () => {
  it('accepts valid comparison', () => {
    const result = createComparisonSchema.safeParse({
      locationA: {
        city: 'London',
        country: 'GB',
        latitude: 51.5,
        longitude: -0.12,
        snapshot: { temp: 22 },
      },
      locationB: {
        city: 'Paris',
        country: 'FR',
        latitude: 48.85,
        longitude: 2.35,
        snapshot: { temp: 25 },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing snapshot', () => {
    const result = createComparisonSchema.safeParse({
      locationA: { city: 'London', country: 'GB', latitude: 51.5, longitude: -0.12 },
      locationB: { city: 'Paris', country: 'FR', latitude: 48.85, longitude: 2.35 },
    });
    expect(result.success).toBe(false);
  });
});
