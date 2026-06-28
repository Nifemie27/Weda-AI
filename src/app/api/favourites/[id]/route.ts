import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { updateFavouriteSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const favourite = await prisma.favouriteLocation.findUnique({ where: { id } });

    if (!favourite) {
      return errorResponse('NOT_FOUND', 'Favourite not found.', 404);
    }

    return successResponse(favourite);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateFavouriteSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.favouriteLocation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Favourite not found.', 404);
    }

    const { lastWeatherSnapshot, ...rest } = parsed.data;
    const favourite = await prisma.favouriteLocation.update({
      where: { id },
      data: {
        ...rest,
        ...(lastWeatherSnapshot !== undefined && {
          lastWeatherSnapshot: lastWeatherSnapshot as Prisma.InputJsonValue,
        }),
      },
    });

    return successResponse(favourite);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.favouriteLocation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Favourite not found.', 404);
    }

    await prisma.favouriteLocation.delete({ where: { id } });
    return successResponse({ deleted: true });
  });
}
