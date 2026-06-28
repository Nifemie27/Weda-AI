import { type NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  buildPaginationMeta,
  withErrorHandling,
} from '@/lib/api-helpers';
import { createFavouriteSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const search = searchParams.get('search');
    const where: Prisma.FavouriteLocationWhereInput = {};

    if (search) {
      where.OR = [
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [favourites, total] = await Promise.all([
      prisma.favouriteLocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.favouriteLocation.count({ where }),
    ]);

    return paginatedResponse(favourites, buildPaginationMeta(total, page, pageSize));
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const parsed = createFavouriteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.favouriteLocation.findFirst({
      where: {
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        userId: null,
      },
    });

    if (existing) {
      return errorResponse('DUPLICATE', 'This location is already in your favourites.', 409);
    }

    const favourite = await prisma.favouriteLocation.create({
      data: {
        ...parsed.data,
        lastWeatherSnapshot: parsed.data.lastWeatherSnapshot as Prisma.InputJsonValue,
      },
    });

    return successResponse(favourite, 201);
  });
}
