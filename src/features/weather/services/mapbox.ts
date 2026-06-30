import type { GeocodingResult } from '../types';

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

interface MapboxFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    name: string;
    place_formatted?: string;
    full_address?: string;
    feature_type: string;
    context?: {
      country?: { name: string };
      region?: { name: string };
      place?: { name: string };
      postcode?: { name: string };
    };
  };
}

interface MapboxGeocodeResponse {
  type: 'FeatureCollection';
  features: MapboxFeature[];
}

// Searches across cities, towns, postal codes, landmarks/POIs, and addresses in one call
export async function geocodeForward(query: string, limit = 5): Promise<GeocodingResult[]> {
  const url = new URL(`${MAPBOX_GEOCODING_URL}/forward`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('access_token', getAccessToken());
  // Search across places, postcodes, points of interest, addresses, regions
  url.searchParams.set(
    'types',
    'country,region,postcode,district,place,locality,neighborhood,address,poi'
  );

  const response = await fetch(url.toString(), { next: { revalidate: 86400 } });

  if (!response.ok) {
    if (response.status === 401) throw new MapboxError(401, 'Mapbox authentication failed.');
    if (response.status === 429)
      throw new MapboxError(429, 'Mapbox rate limit exceeded. Please try again shortly.');
    throw new MapboxError(response.status, 'Failed to search for location.');
  }

  const data: MapboxGeocodeResponse = await response.json();
  return data.features.map(transformFeature);
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

  const data: MapboxGeocodeResponse = await response.json();
  return data.features.map(transformFeature);
}

function transformFeature(feature: MapboxFeature): GeocodingResult {
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
    address: 'address',
    poi: 'poi',
  };

  return {
    name: props.name,
    latitude: lat,
    longitude: lon,
    country,
    state,
    displayName: props.place_formatted || props.full_address || props.name,
    placeType: featureTypeMap[props.feature_type] || 'place',
  };
}

export { MapboxError };
