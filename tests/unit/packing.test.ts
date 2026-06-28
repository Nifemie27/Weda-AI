import { describe, it, expect } from 'vitest';
import { generatePackingList } from '@/features/packing/services/packing-service';
import type { CurrentWeather, ForecastDay } from '@/features/weather/types';

function makeWeather(overrides: Partial<CurrentWeather> = {}): CurrentWeather {
  return {
    temperature: 22,
    feelsLike: 21,
    tempMin: 18,
    tempMax: 25,
    humidity: 55,
    pressure: 1013,
    windSpeed: 10,
    windDeg: 180,
    visibility: 10000,
    cloudCoverage: 40,
    condition: 'Clouds',
    conditionDescription: 'scattered clouds',
    conditionIcon: '03d',
    sunrise: '2026-06-28T05:00:00.000Z',
    sunset: '2026-06-28T21:00:00.000Z',
    timezone: 3600,
    location: { city: 'London', country: 'GB', latitude: 51.5, longitude: -0.12 },
    ...overrides,
  };
}

function makeForecast(overrides: Partial<ForecastDay> = {}): ForecastDay[] {
  const base: ForecastDay = {
    date: '2026-06-28',
    tempHigh: 25,
    tempLow: 15,
    humidity: 60,
    windSpeed: 12,
    rainChance: 20,
    condition: 'Clouds',
    conditionDescription: 'cloudy',
    conditionIcon: '04d',
    summary: 'Warm, with cloudy',
  };
  return [
    { ...base, ...overrides },
    { ...base, date: '2026-06-29' },
    { ...base, date: '2026-06-30' },
  ];
}

describe('generatePackingList', () => {
  it('returns essential items for any trip', () => {
    const list = generatePackingList(makeWeather(), makeForecast());
    const items = list.items.map((i) => i.item);
    expect(items).toContain('Comfortable walking shoes');
    expect(items).toContain('Water bottle');
    expect(items).toContain('Portable charger');
  });

  it('recommends swimsuit for hot weather', () => {
    const list = generatePackingList(
      makeWeather({ temperature: 35 }),
      makeForecast({ tempHigh: 35 })
    );
    expect(list.items.some((i) => i.item === 'Swimsuit')).toBe(true);
  });

  it('recommends coat for cold weather', () => {
    const list = generatePackingList(makeWeather({ temperature: 5 }), makeForecast({ tempLow: 2 }));
    expect(list.items.some((i) => i.item === 'Winter coat')).toBe(true);
  });

  it('recommends gloves and hat for freezing weather', () => {
    const list = generatePackingList(
      makeWeather({ temperature: -5 }),
      makeForecast({ tempLow: -8 })
    );
    const items = list.items.map((i) => i.item);
    expect(items).toContain('Insulated gloves');
    expect(items).toContain('Warm hat / beanie');
  });

  it('recommends waterproof gear for high rain chance', () => {
    const list = generatePackingList(makeWeather(), makeForecast({ rainChance: 80 }));
    const items = list.items.map((i) => i.item);
    expect(items).toContain('Waterproof jacket');
    expect(items).toContain('Umbrella');
  });

  it('recommends sunscreen for high UV', () => {
    const list = generatePackingList(makeWeather({ uvIndex: 8 }), makeForecast());
    expect(list.items.some((i) => i.item === 'Sunscreen (SPF 30+)')).toBe(true);
  });

  it('recommends first aid kit for long trips', () => {
    const list = generatePackingList(makeWeather(), makeForecast(), 7);
    expect(list.items.some((i) => i.item === 'First aid kit')).toBe(true);
  });

  it('does not recommend first aid kit for short trips', () => {
    const list = generatePackingList(makeWeather(), makeForecast(), 2);
    expect(list.items.some((i) => i.item === 'First aid kit')).toBe(false);
  });

  it('generates a summary with temperature range', () => {
    const list = generatePackingList(makeWeather(), makeForecast());
    expect(list.summary).toContain('°C');
    expect(list.destination).toBe('London');
  });

  it('includes snow boots when snowing', () => {
    const list = generatePackingList(makeWeather({ snow1h: 3 }), makeForecast());
    expect(list.items.some((i) => i.item === 'Snow boots')).toBe(true);
  });

  it('every item has a reason', () => {
    const list = generatePackingList(makeWeather({ uvIndex: 9 }), makeForecast({ rainChance: 60 }));
    for (const item of list.items) {
      expect(item.reason.length).toBeGreaterThan(10);
    }
  });
});
