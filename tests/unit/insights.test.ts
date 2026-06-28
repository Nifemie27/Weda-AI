import { describe, it, expect } from 'vitest';
import {
  generateInsights,
  calculateTravelConditions,
  generateNaturalLanguageSummary,
} from '@/features/weather/services/insights';
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

function makeForecast(overrides: Partial<ForecastDay>[] = []): ForecastDay[] {
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
    { ...base, ...overrides[0] },
    { ...base, date: '2026-06-29', ...overrides[1] },
    { ...base, date: '2026-06-30', ...overrides[2] },
  ];
}

describe('generateInsights', () => {
  it('returns warm weather insight for temps >= 25', () => {
    const weather = makeWeather({ temperature: 27 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Warm weather')).toBe(true);
  });

  it('returns extreme heat warning for temps >= 30', () => {
    const weather = makeWeather({ temperature: 35 });
    const insights = generateInsights(weather, makeForecast());
    const heat = insights.find((i) => i.title === 'Extreme heat');
    expect(heat).toBeDefined();
    expect(heat!.severity).toBe('warning');
  });

  it('returns freezing warning for temps <= 0', () => {
    const weather = makeWeather({ temperature: -5 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Freezing conditions')).toBe(true);
  });

  it('returns UV warning for high UV index', () => {
    const weather = makeWeather({ uvIndex: 11 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Very high UV index')).toBe(true);
  });

  it('returns air quality warning for AQI >= 4', () => {
    const weather = makeWeather({ airQualityIndex: 4 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.category === 'health' && i.title.includes('air quality'))).toBe(
      true
    );
  });

  it('returns storm wind warning', () => {
    const weather = makeWeather({ windSpeed: 80 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Storm-force winds')).toBe(true);
  });

  it('returns heavy rain insight', () => {
    const weather = makeWeather({ rain1h: 10 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Heavy rainfall')).toBe(true);
  });

  it('returns poor visibility warning', () => {
    const weather = makeWeather({ visibility: 500 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Poor visibility')).toBe(true);
  });

  it('returns best day insight when forecast has multiple days', () => {
    const forecast = makeForecast([{}, { rainChance: 80 }, { rainChance: 5, tempHigh: 28 }]);
    const insights = generateInsights(makeWeather(), forecast);
    expect(insights.some((i) => i.title === 'Best day this week')).toBe(true);
  });

  it('returns sightseeing insight for clear warm weather', () => {
    const weather = makeWeather({ condition: 'Clear', temperature: 22 });
    const insights = generateInsights(weather, makeForecast());
    expect(insights.some((i) => i.title === 'Perfect sightseeing weather')).toBe(true);
  });
});

describe('calculateTravelConditions', () => {
  it('returns high scores for good weather', () => {
    const conditions = calculateTravelConditions(makeWeather());
    expect(conditions.driving.score).toBeGreaterThanOrEqual(80);
    expect(conditions.walking.score).toBeGreaterThanOrEqual(80);
    expect(conditions.cycling.score).toBeGreaterThanOrEqual(80);
    expect(conditions.flying.riskLevel).toBe('Low');
  });

  it('reduces cycling score in storm winds', () => {
    const conditions = calculateTravelConditions(makeWeather({ windSpeed: 80 }));
    expect(conditions.cycling.score).toBeLessThan(50);
    expect(conditions.cycling.notes.length).toBeGreaterThan(0);
  });

  it('reduces driving score in heavy rain', () => {
    const conditions = calculateTravelConditions(makeWeather({ rain1h: 10 }));
    expect(conditions.driving.score).toBeLessThan(90);
    expect(conditions.driving.notes).toContain('Reduced visibility, wet roads');
  });

  it('flags thunderstorm flight risk', () => {
    const conditions = calculateTravelConditions(makeWeather({ condition: 'Thunderstorm' }));
    expect(conditions.flying.notes.some((n) => n.includes('flight'))).toBe(true);
    expect(conditions.outdoorActivityScore).toBeLessThan(60);
  });

  it('reduces scores in freezing conditions', () => {
    const conditions = calculateTravelConditions(makeWeather({ temperature: -10 }));
    expect(conditions.driving.score).toBeLessThan(90);
    expect(conditions.weatherRiskScore).toBeGreaterThan(0);
  });
});

describe('generateNaturalLanguageSummary', () => {
  it('generates a readable summary', () => {
    const summary = generateNaturalLanguageSummary(makeWeather(), makeForecast());
    expect(summary).toContain('22°C');
    expect(summary).toContain('scattered clouds');
    expect(summary.length).toBeGreaterThan(30);
  });

  it('mentions rain when present', () => {
    const summary = generateNaturalLanguageSummary(makeWeather({ rain1h: 2 }), makeForecast());
    expect(summary).toContain('umbrella');
  });

  it('includes tomorrow forecast', () => {
    const summary = generateNaturalLanguageSummary(makeWeather(), makeForecast());
    expect(summary).toContain('Tomorrow');
  });
});
