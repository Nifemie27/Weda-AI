import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { updateTripSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return errorResponse('NOT_FOUND', 'Trip not found.', 404);
    }

    return successResponse(trip);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTripSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Trip not found.', 404);
    }

    const { weatherSnapshot, ...rest } = parsed.data;
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...rest,
        ...(weatherSnapshot !== undefined && {
          weatherSnapshot: weatherSnapshot as Prisma.InputJsonValue,
        }),
      },
    });

    return successResponse(trip);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Trip not found.', 404);
    }

    await prisma.trip.delete({ where: { id } });
    return successResponse({ deleted: true });
  });
}
