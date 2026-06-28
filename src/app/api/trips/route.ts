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
import { createTripSchema, tripListParamsSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const deviceId = getDeviceIdFromHeaders(request.headers);

    const parsed = tripListParamsSchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { page, pageSize, sortBy, sortOrder, status, search } = parsed.data;
    const { skip } = getPaginationParams(searchParams);

    const where: Prisma.TripWhereInput = { deviceId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { destination: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      prisma.trip.count({ where }),
    ]);

    return paginatedResponse(trips, buildPaginationMeta(total, page, pageSize));
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const deviceId = getDeviceIdFromHeaders(request.headers);
    const parsed = createTripSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const trip = await prisma.trip.create({
      data: {
        ...parsed.data,
        deviceId,
        weatherSnapshot: parsed.data.weatherSnapshot as Prisma.InputJsonValue,
      },
    });

    return successResponse(trip, 201);
  });
}
