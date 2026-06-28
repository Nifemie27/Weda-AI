import { type NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  buildPaginationMeta,
  withErrorHandling,
  getDeviceIdFromHeaders,
} from '@/lib/api-helpers';
import { weatherSearchHistoryParamsSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const deviceId = getDeviceIdFromHeaders(request.headers);

    const parsed = weatherSearchHistoryParamsSchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { page, pageSize, sortBy, sortOrder, city, country } = parsed.data;
    const { skip } = getPaginationParams(searchParams);

    const where: Prisma.WeatherSearchWhereInput = { deviceId };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };

    const [searches, total] = await Promise.all([
      prisma.weatherSearch.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      prisma.weatherSearch.count({ where }),
    ]);

    return paginatedResponse(searches, buildPaginationMeta(total, page, pageSize));
  });
}

export async function DELETE(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const clearAll = searchParams.get('all') === 'true';
    const deviceId = getDeviceIdFromHeaders(request.headers);

    if (clearAll) {
      const result = await prisma.weatherSearch.deleteMany({ where: { deviceId } });
      return successResponse({ deleted: result.count });
    }

    return errorResponse('MISSING_PARAMS', 'Use ?all=true to clear all history.', 400);
  });
}
