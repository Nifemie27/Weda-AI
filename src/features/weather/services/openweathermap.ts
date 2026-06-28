import { OPENWEATHERMAP_BASE_URL, WEATHER_UNITS } from '@/lib/constants';
import type {
  OWMCurrentResponse,
  OWMForecastResponse,
  OWMAirQualityResponse,
  OWMGeocodingResult,
  CurrentWeather,
  ForecastDay,
  HourlyForecast,
  GeocodingResult,
  LocationInfo,
} from '../types';

class WeatherApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

function getApiKey(): string {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) throw new Error('OPENWEATHERMAP_API_KEY is not configured');
  return key;
}

async function owmFetch<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(path, OPENWEATHERMAP_BASE_URL);
  url.searchParams.set('appid', getApiKey());
  url.searchParams.set('units', WEATHER_UNITS);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) {
      throw new WeatherApiError(
        404,
        'Location not found. Please check the city name or coordinates.'
      );
    }
    if (response.status === 401) {
      throw new WeatherApiError(401, 'Weather API authentication failed.');
    }
    if (response.status === 429) {
      throw new WeatherApiError(429, 'Weather API rate limit exceeded. Please try again shortly.');
    }
    throw new WeatherApiError(response.status, `Weather API error: ${body}`);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Raw API calls
// ─────────────────────────────────────────────

export async function fetchCurrentWeatherRaw(
  lat: number,
  lon: number
): Promise<OWMCurrentResponse> {
  return owmFetch<OWMCurrentResponse>('/data/2.5/weather', { lat, lon });
}

export async function fetchForecastRaw(lat: number, lon: number): Promise<OWMForecastResponse> {
  return owmFetch<OWMForecastResponse>('/data/2.5/forecast', { lat, lon });
}

export async function fetchAirQualityRaw(lat: number, lon: number): Promise<OWMAirQualityResponse> {
  return owmFetch<OWMAirQualityResponse>('/data/2.5/air_pollution', { lat, lon });
}

export async function geocodeByName(query: string, limit = 5): Promise<OWMGeocodingResult[]> {
  return owmFetch<OWMGeocodingResult[]>('/geo/1.0/direct', { q: query, limit });
}

export async function geocodeByZip(zip: string): Promise<OWMGeocodingResult> {
  return owmFetch<OWMGeocodingResult>('/geo/1.0/zip', { zip });
}

export async function reverseGeocode(lat: number, lon: number): Promise<OWMGeocodingResult[]> {
  return owmFetch<OWMGeocodingResult[]>('/geo/1.0/reverse', { lat, lon, limit: 1 });
}

// ─────────────────────────────────────────────
// Transformers — raw API → normalized app types
// ─────────────────────────────────────────────

export function transformCurrentWeather(
  raw: OWMCurrentResponse,
  airQuality?: OWMAirQualityResponse
): CurrentWeather {
  const aq = airQuality?.list?.[0];
  const weather = raw.weather[0];

  return {
    temperature: raw.main.temp,
    feelsLike: raw.main.feels_like,
    tempMin: raw.main.temp_min,
    tempMax: raw.main.temp_max,
    humidity: raw.main.humidity,
    pressure: raw.main.pressure,
    windSpeed: raw.wind.speed,
    windDeg: raw.wind.deg,
    windGust: raw.wind.gust,
    visibility: raw.visibility,
    cloudCoverage: raw.clouds.all,
    condition: weather.main,
    conditionDescription: weather.description,
    conditionIcon: weather.icon,
    sunrise: new Date(raw.sys.sunrise * 1000).toISOString(),
    sunset: new Date(raw.sys.sunset * 1000).toISOString(),
    timezone: raw.timezone,
    airQualityIndex: aq?.main.aqi,
    airQualityComponents: aq?.components,
    rain1h: raw.rain?.['1h'],
    snow1h: raw.snow?.['1h'],
    location: {
      city: raw.name,
      country: raw.sys.country,
      latitude: raw.coord.lat,
      longitude: raw.coord.lon,
    },
  };
}

export function transformForecastDays(raw: OWMForecastResponse): ForecastDay[] {
  const dayMap = new Map<string, OWMForecastResponse['list']>();

  for (const item of raw.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push(item);
  }

  const days: ForecastDay[] = [];

  for (const [date, items] of dayMap) {
    const temps = items.map((i) => i.main.temp);
    const maxPop = Math.max(...items.map((i) => i.pop));
    const maxHumidity = Math.max(...items.map((i) => i.main.humidity));
    const maxWind = Math.max(...items.map((i) => i.wind.speed));

    const middayItem =
      items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
    const weather = middayItem.weather[0];

    days.push({
      date,
      tempHigh: Math.round(Math.max(...temps) * 10) / 10,
      tempLow: Math.round(Math.min(...temps) * 10) / 10,
      humidity: maxHumidity,
      windSpeed: Math.round(maxWind * 10) / 10,
      rainChance: Math.round(maxPop * 100),
      condition: weather.main,
      conditionDescription: weather.description,
      conditionIcon: weather.icon,
      summary: generateDaySummary(weather.main, Math.max(...temps), maxPop),
    });
  }

  return days.slice(0, 5);
}

export function transformHourlyForecast(raw: OWMForecastResponse): HourlyForecast[] {
  return raw.list.slice(0, 24).map((item) => ({
    time: new Date(item.dt * 1000).toISOString(),
    temperature: item.main.temp,
    feelsLike: item.main.feels_like,
    humidity: item.main.humidity,
    windSpeed: item.wind.speed,
    rainChance: Math.round(item.pop * 100),
    condition: item.weather[0].main,
    conditionIcon: item.weather[0].icon,
  }));
}

export function transformGeocodingResults(raw: OWMGeocodingResult[]): GeocodingResult[] {
  return raw.map((r) => ({
    name: r.name,
    latitude: r.lat,
    longitude: r.lon,
    country: r.country,
    state: r.state,
    displayName: r.state ? `${r.name}, ${r.state}, ${r.country}` : `${r.name}, ${r.country}`,
  }));
}

// ─────────────────────────────────────────────
// Composite fetchers — high-level convenience
// ─────────────────────────────────────────────

export async function getFullWeather(lat: number, lon: number) {
  const [currentRaw, forecastRaw, airQualityRaw] = await Promise.all([
    fetchCurrentWeatherRaw(lat, lon),
    fetchForecastRaw(lat, lon),
    fetchAirQualityRaw(lat, lon).catch(() => undefined),
  ]);

  return {
    current: transformCurrentWeather(currentRaw, airQualityRaw),
    forecast: transformForecastDays(forecastRaw),
    hourly: transformHourlyForecast(forecastRaw),
  };
}

export async function resolveLocation(
  query?: string,
  lat?: number,
  lon?: number,
  zip?: string
): Promise<LocationInfo> {
  if (lat !== undefined && lon !== undefined) {
    const results = await reverseGeocode(lat, lon);
    if (results.length === 0)
      throw new WeatherApiError(404, 'No location found for these coordinates.');
    return {
      city: results[0].name,
      country: results[0].country,
      state: results[0].state,
      latitude: results[0].lat,
      longitude: results[0].lon,
    };
  }

  if (zip) {
    const result = await geocodeByZip(zip);
    return {
      city: result.name,
      country: result.country,
      latitude: result.lat,
      longitude: result.lon,
    };
  }

  if (query) {
    const results = await geocodeByName(query, 1);
    if (results.length === 0) throw new WeatherApiError(404, `No location found for "${query}".`);
    return {
      city: results[0].name,
      country: results[0].country,
      state: results[0].state,
      latitude: results[0].lat,
      longitude: results[0].lon,
    };
  }

  throw new WeatherApiError(400, 'Provide a city name, coordinates, or postal code.');
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateDaySummary(condition: string, maxTemp: number, maxPop: number): string {
  const parts: string[] = [];

  if (maxPop > 0.7) parts.push('Heavy rain likely');
  else if (maxPop > 0.4) parts.push('Rain possible');

  if (maxTemp >= 30) parts.push('Hot');
  else if (maxTemp >= 20) parts.push('Warm');
  else if (maxTemp >= 10) parts.push('Cool');
  else parts.push('Cold');

  const conditionMap: Record<string, string> = {
    Clear: 'clear skies',
    Clouds: 'cloudy',
    Rain: 'rainy',
    Drizzle: 'light rain',
    Thunderstorm: 'thunderstorms',
    Snow: 'snowy',
    Mist: 'misty',
    Fog: 'foggy',
    Haze: 'hazy',
  };

  parts.push(`with ${conditionMap[condition] || condition.toLowerCase()}`);

  return parts.join(', ');
}

export { WeatherApiError };
