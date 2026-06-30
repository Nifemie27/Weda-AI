import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import {
  geocodeByName,
  geocodeByZip,
  reverseGeocode,
  transformGeocodingResults,
  WeatherApiError,
} from '@/features/weather/services/openweathermap';
import {
  geocodeForward,
  reverseGeocodeMapbox,
  MapboxError,
} from '@/features/weather/services/mapbox';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zip = searchParams.get('zip');

    try {
      if (lat && lon) {
        try {
          const results = await reverseGeocodeMapbox(parseFloat(lat), parseFloat(lon));
          if (results.length > 0) return successResponse(results);
        } catch {
          // fall through to OpenWeatherMap
        }
        const raw = await reverseGeocode(parseFloat(lat), parseFloat(lon));
        return successResponse(transformGeocodingResults(raw));
      }

      if (zip) {
        try {
          const results = await geocodeForward(zip, 5);
          if (results.length > 0) return successResponse(results);
        } catch {
          // fall through to OpenWeatherMap
        }
        const raw = await geocodeByZip(zip);
        return successResponse(
          transformGeocodingResults([
            { name: raw.name, lat: raw.lat, lon: raw.lon, country: raw.country },
          ])
        );
      }

      if (q) {
        // Mapbox handles cities, towns, postal codes, landmarks/POIs, and
        // addresses in a single unified search
        try {
          const results = await geocodeForward(q, 6);
          if (results.length > 0) return successResponse(results);
        } catch {
          // fall through to OpenWeatherMap (city-name only)
        }
        const raw = await geocodeByName(q, 5);
        return successResponse(transformGeocodingResults(raw));
      }

      return errorResponse('MISSING_PARAMS', 'Provide q, zip, or lat & lon.', 400);
    } catch (error) {
      if (error instanceof WeatherApiError) {
        return errorResponse('GEOCODING_ERROR', error.message, error.status);
      }
      if (error instanceof MapboxError) {
        return errorResponse('GEOCODING_ERROR', error.message, error.status);
      }
      throw error;
    }
  });
}
