import { describe, it, expect } from 'vitest';
import {
  formatTemperature,
  formatWindSpeed,
  formatVisibility,
  formatPressure,
  formatPercent,
  formatDate,
  getWindDirection,
  getWeatherIconUrl,
} from '@/features/weather/utils';

describe('formatTemperature', () => {
  it('rounds to nearest integer', () => {
    expect(formatTemperature(22.7)).toBe('23°C');
    expect(formatTemperature(22.3)).toBe('22°C');
  });

  it('handles negative temperatures', () => {
    expect(formatTemperature(-5.2)).toBe('-5°C');
  });

  it('handles zero', () => {
    expect(formatTemperature(0)).toBe('0°C');
  });
});

describe('formatWindSpeed', () => {
  it('formats with km/h unit', () => {
    expect(formatWindSpeed(15.7)).toBe('16 km/h');
  });
});

describe('formatVisibility', () => {
  it('shows km for >= 1000m', () => {
    expect(formatVisibility(10000)).toBe('10.0 km');
    expect(formatVisibility(1500)).toBe('1.5 km');
  });

  it('shows metres for < 1000m', () => {
    expect(formatVisibility(500)).toBe('500 m');
  });
});

describe('formatPressure', () => {
  it('formats with hPa unit', () => {
    expect(formatPressure(1013)).toBe('1013 hPa');
  });
});

describe('formatPercent', () => {
  it('rounds and adds percent sign', () => {
    expect(formatPercent(55.6)).toBe('56%');
    expect(formatPercent(0)).toBe('0%');
  });
});

describe('formatDate', () => {
  it('formats date string to readable format', () => {
    const result = formatDate('2026-06-28');
    expect(result).toContain('Jun');
    expect(result).toContain('28');
  });
});

describe('getWindDirection', () => {
  it('returns correct cardinal direction', () => {
    expect(getWindDirection(0)).toBe('N');
    expect(getWindDirection(90)).toBe('E');
    expect(getWindDirection(180)).toBe('S');
    expect(getWindDirection(270)).toBe('W');
  });

  it('returns intercardinal directions', () => {
    expect(getWindDirection(45)).toBe('NE');
    expect(getWindDirection(135)).toBe('SE');
    expect(getWindDirection(225)).toBe('SW');
    expect(getWindDirection(315)).toBe('NW');
  });
});

describe('getWeatherIconUrl', () => {
  it('returns correct URL format', () => {
    expect(getWeatherIconUrl('04d')).toBe('https://openweathermap.org/img/wn/04d@2x.png');
    expect(getWeatherIconUrl('01n', '4x')).toBe('https://openweathermap.org/img/wn/01n@4x.png');
  });
});
