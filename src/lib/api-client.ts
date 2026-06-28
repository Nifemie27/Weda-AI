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

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(response.status, data.error.code, data.error.message);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'TIMEOUT', 'Request timed out');
    }

    throw new ApiError(500, 'NETWORK_ERROR', 'A network error occurred. Please try again.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export { apiClient, ApiError };
