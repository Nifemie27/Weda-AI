'use client';

import { WifiOff, MapPinOff, AlertTriangle, Clock, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';

interface ErrorMessageProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  if (!error) return null;

  const { icon: Icon, title, description, color } = getErrorDisplay(error);

  return (
    <div
      className={`rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 p-6 ${className || ''}`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-foreground/60 max-w-md">{description}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

function getErrorDisplay(error: Error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'OFFLINE':
        return {
          icon: WifiOff,
          title: 'No Internet Connection',
          description: error.message,
          color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        };
      case 'NOT_FOUND':
      case 'WEATHER_ERROR':
      case 'GEOCODING_ERROR':
        return {
          icon: MapPinOff,
          title: 'Location Not Found',
          description:
            "We couldn't find that location. Try searching with a different name, postal code, or coordinates.",
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        };
      case 'TIMEOUT':
        return {
          icon: Clock,
          title: 'Request Timed Out',
          description: error.message,
          color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        };
      case 'RATE_LIMIT':
        return {
          icon: Clock,
          title: 'Too Many Requests',
          description: error.message,
          color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        };
      case 'SERVER_ERROR':
      case 'INTERNAL_ERROR':
        return {
          icon: ServerCrash,
          title: 'Server Error',
          description: 'Our servers are having trouble. Please try again in a few moments.',
          color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'NETWORK_ERROR':
        return {
          icon: WifiOff,
          title: 'Connection Problem',
          description: error.message,
          color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Something Went Wrong',
          description: error.message,
          color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        };
    }
  }

  return {
    icon: AlertTriangle,
    title: 'Unexpected Error',
    description: error.message || 'An unexpected error occurred. Please try again.',
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
}
