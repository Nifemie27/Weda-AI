import { type NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  buildPaginationMeta,
  withErrorHandling,
} from '@/lib/api-helpers';
import { createComparisonSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const [comparisons, total] = await Promise.all([
      prisma.weatherComparison.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.weatherComparison.count(),
    ]);

    return paginatedResponse(comparisons, buildPaginationMeta(total, page, pageSize));
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const parsed = createComparisonSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { locationA, locationB } = parsed.data;

    const comparison = await prisma.weatherComparison.create({
      data: {
        locationACity: locationA.city,
        locationACountry: locationA.country,
        locationALatitude: locationA.latitude,
        locationALongitude: locationA.longitude,
        locationASnapshot: locationA.snapshot as Prisma.InputJsonValue,
        locationBCity: locationB.city,
        locationBCountry: locationB.country,
        locationBLatitude: locationB.latitude,
        locationBLongitude: locationB.longitude,
        locationBSnapshot: locationB.snapshot as Prisma.InputJsonValue,
      },
    });

    return successResponse(comparison, 201);
  });
}
