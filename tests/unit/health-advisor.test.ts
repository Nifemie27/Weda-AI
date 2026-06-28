import { describe, it, expect } from 'vitest';
import { generateHealthAdvice } from '@/features/travel/services/health-advisor';
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

function makeForecast(): ForecastDay[] {
  return [
    {
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
    },
    {
      date: '2026-06-29',
      tempHigh: 25,
      tempLow: 15,
      humidity: 60,
      windSpeed: 12,
      rainChance: 20,
      condition: 'Clouds',
      conditionDescription: 'cloudy',
      conditionIcon: '04d',
      summary: 'Warm, with cloudy',
    },
  ];
}

describe('generateHealthAdvice', () => {
  it('warns about extreme UV', () => {
    const advice = generateHealthAdvice(makeWeather({ uvIndex: 11 }), makeForecast());
    const uv = advice.find((a) => a.category === 'uv');
    expect(uv).toBeDefined();
    expect(uv!.severity).toBe('warning');
    expect(uv!.advice).toContain('SPF 50+');
  });

  it('warns about poor air quality', () => {
    const advice = generateHealthAdvice(makeWeather({ airQualityIndex: 5 }), makeForecast());
    const aq = advice.find((a) => a.category === 'air');
    expect(aq).toBeDefined();
    expect(aq!.advice).toContain('N95');
  });

  it('warns about dangerous heat', () => {
    const advice = generateHealthAdvice(makeWeather({ temperature: 42 }), makeForecast());
    expect(advice.some((a) => a.title === 'Dangerous heat')).toBe(true);
  });

  it('warns about freezing and frostbite', () => {
    const advice = generateHealthAdvice(makeWeather({ temperature: -10 }), makeForecast());
    expect(advice.some((a) => a.title === 'Frostbite risk')).toBe(true);
  });

  it('advises on high humidity with heat', () => {
    const advice = generateHealthAdvice(
      makeWeather({ humidity: 90, temperature: 28 }),
      makeForecast()
    );
    expect(advice.some((a) => a.title === 'High humidity')).toBe(true);
  });

  it('advises waterproof footwear in rain', () => {
    const advice = generateHealthAdvice(makeWeather({ rain1h: 3 }), makeForecast());
    expect(advice.some((a) => a.title === 'Wet conditions')).toBe(true);
  });

  it('warns about upcoming temperature drops', () => {
    const forecast = makeForecast();
    forecast[1].tempLow = 5;
    const advice = generateHealthAdvice(makeWeather({ temperature: 25 }), forecast);
    expect(advice.some((a) => a.title === 'Significant temperature drop ahead')).toBe(true);
  });

  it('returns hydration reminder in comfortable weather', () => {
    const advice = generateHealthAdvice(makeWeather({ temperature: 22 }), makeForecast());
    expect(advice.some((a) => a.category === 'hydration')).toBe(true);
  });

  it('every advice has an icon and non-empty advice text', () => {
    const advice = generateHealthAdvice(
      makeWeather({ uvIndex: 9, temperature: 35, rain1h: 2 }),
      makeForecast()
    );
    for (const item of advice) {
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.advice.length).toBeGreaterThan(20);
    }
  });
});
