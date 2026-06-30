import type { ApiResponse } from '@/types';
import { getDeviceId } from '@/hooks/use-device-id';

export class ApiError extends Error {
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

function friendlyMessage(status: number, code: string, raw?: string): string {
  const map: Record<string, string> = {
    OFFLINE: 'No internet connection. Please check your network and try again.',
    NOT_FOUND: 'Location not found. Please check the name and try again.',
    TIMEOUT: 'Request timed out. Please check your connection and try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    DB_ERROR: 'Could not save data. Please try again.',
    YOUTUBE_QUOTA: 'Travel videos unavailable right now — daily quota reached.',
    GEOCODING_ERROR: 'Location not found. Try a different city name, postal code, or coordinates.',
    SERVER_ERROR: 'Server error. Please try again in a moment.',
    CONFIG_ERROR: 'A service is not configured correctly. Please contact support.',
  };
  if (map[code]) return map[code];
  if (status === 404) return map.NOT_FOUND;
  if (status === 408) return map.TIMEOUT;
  if (status === 429) return map.RATE_LIMIT;
  if (status >= 500) return map.SERVER_ERROR;
  return raw || 'Something went wrong. Please try again.';
}

async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, params, timeout = 10000, ...init } = options;

  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new ApiError(0, 'OFFLINE', friendlyMessage(0, 'OFFLINE'));
  }

  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
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
      const { code, message } = data.error;
      throw new ApiError(response.status, code, friendlyMessage(response.status, code, message));
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'TIMEOUT', friendlyMessage(408, 'TIMEOUT'));
    }

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new ApiError(0, 'NETWORK_ERROR', friendlyMessage(0, 'NETWORK_ERROR'));
    }

    throw new ApiError(500, 'UNKNOWN', 'Something went wrong. Please try again.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export { apiClient };
