import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { fetchAirQualityRaw, WeatherApiError } from '@/features/weather/services/openweathermap';
import { AQI_LABELS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return errorResponse('MISSING_PARAMS', 'Provide lat and lon.', 400);
    }

    try {
      const raw = await fetchAirQualityRaw(parseFloat(lat), parseFloat(lon));
      const data = raw.list[0];

      return successResponse({
        aqi: data.main.aqi,
        label: AQI_LABELS[data.main.aqi - 1] || 'Unknown',
        components: data.components,
      });
    } catch (error) {
      if (error instanceof WeatherApiError) {
        return errorResponse('AIR_QUALITY_ERROR', error.message, error.status);
      }
      throw error;
    }
  });
}
