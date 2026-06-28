import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { weatherSearchQuerySchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import {
  resolveLocation,
  getFullWeather,
  WeatherApiError,
} from '@/features/weather/services/openweathermap';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());

    const parsed = weatherSearchQuerySchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { q, lat, lon, zip } = parsed.data;

    try {
      const location = await resolveLocation(q, lat, lon, zip);
      const { current, forecast, hourly } = await getFullWeather(
        location.latitude,
        location.longitude
      );

      const enrichedCurrent = {
        ...current,
        location: {
          ...current.location,
          state: location.state,
        },
      };

      prisma.weatherSearch
        .create({
          data: {
            query: q || zip || `${lat},${lon}`,
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            country: location.country,
            state: location.state,
            temperature: current.temperature,
            feelsLike: current.feelsLike,
            humidity: current.humidity,
            pressure: current.pressure,
            windSpeed: current.windSpeed,
            visibility: current.visibility,
            cloudCoverage: current.cloudCoverage,
            condition: current.condition,
            conditionIcon: current.conditionIcon,
            sunrise: new Date(current.sunrise),
            sunset: new Date(current.sunset),
            timezone: current.timezone,
            uvIndex: current.uvIndex,
            airQualityIndex: current.airQualityIndex,
            rainProbability: current.rainProbability,
            snowProbability: current.snowProbability,
            forecastSnapshot: forecast as object[],
          },
        })
        .catch((err: unknown) => console.error('Failed to persist search:', err));

      return successResponse({ current: enrichedCurrent, forecast, hourly });
    } catch (error) {
      if (error instanceof WeatherApiError) {
        return errorResponse('WEATHER_ERROR', error.message, error.status);
      }
      throw error;
    }
  });
}
