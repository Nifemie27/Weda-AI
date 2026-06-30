// ─────────────────────────────────────────────
// OpenWeatherMap API response types
// ─────────────────────────────────────────────

export interface OWMCoord {
  lat: number;
  lon: number;
}

export interface OWMWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWMCurrentResponse {
  coord: OWMCoord;
  weather: OWMWeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
}

export interface OWMForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: OWMWeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number;
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  dt_txt: string;
}

export interface OWMForecastResponse {
  list: OWMForecastItem[];
  city: {
    id: number;
    name: string;
    coord: OWMCoord;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface OWMAirQualityItem {
  main: { aqi: number };
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  dt: number;
}

export interface OWMAirQualityResponse {
  list: OWMAirQualityItem[];
}

export interface OWMGeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface OWMUVResponse {
  lat: number;
  lon: number;
  date_iso: string;
  value: number;
}

// ─────────────────────────────────────────────
// Normalized app types (what we expose to the UI)
// ─────────────────────────────────────────────

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  visibility: number;
  cloudCoverage: number;
  condition: string;
  conditionDescription: string;
  conditionIcon: string;
  sunrise: string;
  sunset: string;
  timezone: number;
  uvIndex?: number;
  airQualityIndex?: number;
  airQualityComponents?: AirQualityComponents;
  rainProbability?: number;
  snowProbability?: number;
  rain1h?: number;
  snow1h?: number;
  location: LocationInfo;
}

export interface LocationInfo {
  city: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
}

export interface AirQualityComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface ForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  conditionDescription: string;
  conditionIcon: string;
  summary: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  conditionIcon: string;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  displayName: string;
  placeType?: 'place' | 'postcode' | 'poi' | 'address' | 'region' | 'locality' | 'country';
}
