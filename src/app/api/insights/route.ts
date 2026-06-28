import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import {
  resolveLocation,
  getFullWeather,
  WeatherApiError,
} from '@/features/weather/services/openweathermap';
import {
  generateInsights,
  calculateTravelConditions,
  generateNaturalLanguageSummary,
} from '@/features/weather/services/insights';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!q && !lat) {
      return errorResponse('MISSING_PARAMS', 'Provide q or lat & lon.', 400);
    }

    try {
      const location = await resolveLocation(
        q || undefined,
        lat ? parseFloat(lat) : undefined,
        lon ? parseFloat(lon) : undefined
      );

      const { current, forecast, hourly } = await getFullWeather(
        location.latitude,
        location.longitude
      );

      const insights = generateInsights(current, forecast);
      const travelConditions = calculateTravelConditions(current);
      const summary = generateNaturalLanguageSummary(current, forecast);

      return successResponse({
        location,
        summary,
        insights,
        travelConditions,
        current,
        forecast,
        hourly,
      });
    } catch (error) {
      if (error instanceof WeatherApiError) {
        return errorResponse('WEATHER_ERROR', error.message, error.status);
      }
      throw error;
    }
  });
}
