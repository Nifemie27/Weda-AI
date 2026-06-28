import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import {
  resolveLocation,
  fetchForecastRaw,
  transformForecastDays,
  transformHourlyForecast,
  WeatherApiError,
} from '@/features/weather/services/openweathermap';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zip = searchParams.get('zip');

    if (!q && !lat && !zip) {
      return errorResponse('MISSING_PARAMS', 'Provide q, zip, or lat & lon.', 400);
    }

    try {
      const location = await resolveLocation(
        q || undefined,
        lat ? parseFloat(lat) : undefined,
        lon ? parseFloat(lon) : undefined,
        zip || undefined
      );

      const raw = await fetchForecastRaw(location.latitude, location.longitude);

      return successResponse({
        location,
        forecast: transformForecastDays(raw),
        hourly: transformHourlyForecast(raw),
      });
    } catch (error) {
      if (error instanceof WeatherApiError) {
        return errorResponse('WEATHER_ERROR', error.message, error.status);
      }
      throw error;
    }
  });
}
