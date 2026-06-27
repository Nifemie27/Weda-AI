export const APP_NAME = 'Wéda Weather';
export const APP_DESCRIPTION =
  'AI-powered Weather & Travel Assistant for informed travel decisions.';
export const DEVELOPER_NAME = 'Oluwanifemi Oripeloye';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org';
export const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const WEATHER_UNITS = 'metric' as const;

export const CACHE_TTL = {
  WEATHER: 10 * 60 * 1000,
  FORECAST: 30 * 60 * 1000,
  GEOCODE: 24 * 60 * 60 * 1000,
  AIR_QUALITY: 30 * 60 * 1000,
} as const;

export const STALE_TIME = {
  WEATHER: 5 * 60 * 1000,
  FORECAST: 15 * 60 * 1000,
  STATIC: 60 * 60 * 1000,
} as const;

export const TEMPERATURE_THRESHOLDS = {
  FREEZING: 0,
  COLD: 10,
  COOL: 15,
  COMFORTABLE: 20,
  WARM: 25,
  HOT: 30,
  EXTREME: 40,
} as const;

export const UV_THRESHOLDS = {
  LOW: 2,
  MODERATE: 5,
  HIGH: 7,
  VERY_HIGH: 10,
  EXTREME: 11,
} as const;

export const WIND_THRESHOLDS = {
  CALM: 5,
  LIGHT: 15,
  MODERATE: 30,
  STRONG: 50,
  STORM: 75,
} as const;

export const AQI_LABELS = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'] as const;
