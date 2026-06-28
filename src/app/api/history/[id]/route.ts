import { type NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandling } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const search = await prisma.weatherSearch.findUnique({ where: { id } });

    if (!search) {
      return errorResponse('NOT_FOUND', 'Search record not found.', 404);
    }

    return successResponse(search);
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.weatherSearch.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Search record not found.', 404);
    }

    await prisma.weatherSearch.delete({ where: { id } });
    return successResponse({ deleted: true });
  });
}
