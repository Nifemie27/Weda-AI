import type { GeocodingResult } from '../types';

// Search Box API supports cities, towns, postal codes, landmarks/POIs, addresses
const MAPBOX_SEARCH_URL = 'https://api.mapbox.com/search/searchbox/v1';
// Geocoding v6 is used for reverse geocoding only
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6';

class MapboxError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'MapboxError';
  }
}

function getAccessToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('MAPBOX_ACCESS_TOKEN is not configured');
  return token;
}

interface SearchBoxFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    name: string;
    name_preferred?: string;
    place_formatted?: string;
    full_address?: string;
    feature_type: string;
    context?: {
      country?: { name: string };
      region?: { name: string };
    };
  };
}

interface SearchBoxResponse {
  type: 'FeatureCollection';
  features: SearchBoxFeature[];
}

interface GeocodingFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    name: string;
    place_formatted?: string;
    feature_type: string;
    context?: {
      country?: { name: string };
      region?: { name: string };
    };
  };
}

interface GeocodingResponse {
  type: 'FeatureCollection';
  features: GeocodingFeature[];
}

// Searches across cities, towns, postal codes, landmarks/POIs, and addresses
export async function geocodeForward(query: string, limit = 5): Promise<GeocodingResult[]> {
  const url = new URL(`${MAPBOX_SEARCH_URL}/forward`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('access_token', getAccessToken());

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

  if (!response.ok) {
    if (response.status === 401) throw new MapboxError(401, 'Mapbox authentication failed.');
    if (response.status === 429)
      throw new MapboxError(429, 'Too many requests. Please wait a moment.');
    throw new MapboxError(response.status, 'Failed to search for location.');
  }

  const data: SearchBoxResponse = await response.json();
  return data.features.map(transformSearchBoxFeature);
}

export async function reverseGeocodeMapbox(lat: number, lon: number): Promise<GeocodingResult[]> {
  const url = new URL(`${MAPBOX_GEOCODING_URL}/reverse`);
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('access_token', getAccessToken());
  url.searchParams.set('types', 'place,locality,district');

  const response = await fetch(url.toString(), { next: { revalidate: 86400 } });

  if (!response.ok) {
    throw new MapboxError(response.status, 'Failed to resolve coordinates to a location.');
  }

  const data: GeocodingResponse = await response.json();
  return data.features.map(transformGeocodingFeature);
}

function transformSearchBoxFeature(feature: SearchBoxFeature): GeocodingResult {
  const [lon, lat] = feature.geometry.coordinates;
  const props = feature.properties;
  const country = props.context?.country?.name || '';
  const state = props.context?.region?.name;

  const featureTypeMap: Record<string, GeocodingResult['placeType']> = {
    country: 'country',
    region: 'region',
    postcode: 'postcode',
    district: 'locality',
    place: 'place',
    locality: 'locality',
    neighborhood: 'locality',
    street: 'address',
    address: 'address',
    secondary_address: 'address',
    poi: 'poi',
  };

  return {
    name: props.name_preferred || props.name,
    latitude: lat,
    longitude: lon,
    country,
    state,
    displayName: props.place_formatted || props.full_address || props.name,
    placeType: featureTypeMap[props.feature_type] || 'place',
  };
}

function transformGeocodingFeature(feature: GeocodingFeature): GeocodingResult {
  const [lon, lat] = feature.geometry.coordinates;
  const props = feature.properties;
  const country = props.context?.country?.name || '';
  const state = props.context?.region?.name;

  return {
    name: props.name,
    latitude: lat,
    longitude: lon,
    country,
    state,
    displayName: props.place_formatted || props.name,
    placeType: 'place',
  };
}

export { MapboxError };
