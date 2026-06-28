import type { ApiResponse } from '@/types';
import { getDeviceId } from '@/hooks/use-device-id';

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, params, timeout = 10000, ...init } = options;

  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new ApiError(0, 'OFFLINE', 'You are offline. Please check your internet connection.');
  }

  const url = new URL(endpoint, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': getDeviceId(),
        ...init.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 404) {
      throw new ApiError(
        404,
        'NOT_FOUND',
        'Location not found. Please check the name and try again.'
      );
    }

    if (response.status === 429) {
      throw new ApiError(
        429,
        'RATE_LIMIT',
        'Too many requests. Please wait a moment and try again.'
      );
    }

    if (response.status >= 500) {
      throw new ApiError(response.status, 'SERVER_ERROR', 'Server error. Please try again later.');
    }

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(response.status, data.error.code, data.error.message);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        408,
        'TIMEOUT',
        'Request timed out. Please check your connection and try again.'
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'OFFLINE', 'Unable to connect. Please check your internet connection.');
    }

    throw new ApiError(
      500,
      'NETWORK_ERROR',
      'Something went wrong. Please check your connection and try again.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export { apiClient, ApiError };
