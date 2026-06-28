import { NextResponse } from 'next/server';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationMeta,
} from '@/types';

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true as const, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false as const, error: { code, message } }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  status = 200
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({ success: true as const, data, meta }, { status });
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const skip = (page - 1) * pageSize;

  return { page, pageSize, sortBy, sortOrder, skip };
}

export function buildPaginationMeta(total: number, page: number, pageSize: number): PaginationMeta {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getDeviceIdFromHeaders(headers: Headers): string {
  return headers.get('x-device-id') || 'anonymous';
}

export async function withErrorHandling(
  handler: () => Promise<NextResponse | Response>
): Promise<NextResponse | Response> {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error && error.message.includes('Record to')) {
      return errorResponse('NOT_FOUND', 'Resource not found', 404);
    }

    return errorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred. Please try again later.',
      500
    );
  }
}
