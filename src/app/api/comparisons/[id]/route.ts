import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const comparison = await prisma.weatherComparison.findUnique({ where: { id } });

    if (!comparison) {
      return errorResponse('NOT_FOUND', 'Comparison not found.', 404);
    }

    return successResponse(comparison);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.weatherComparison.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Comparison not found.', 404);
    }

    await prisma.weatherComparison.delete({ where: { id } });
    return successResponse({ deleted: true });
  });
}
