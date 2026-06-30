'use client';

import { WifiOff, MapPinOff, Clock, ServerCrash, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

function getConfig(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'OFFLINE':
      case 'NETWORK_ERROR':
        return {
          icon: WifiOff,
          color: 'text-orange-400',
          bg: 'bg-orange-400/10 border-orange-400/20',
        };
      case 'NOT_FOUND':
      case 'GEOCODING_ERROR':
      case 'WEATHER_ERROR':
        return { icon: MapPinOff, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' };
      case 'TIMEOUT':
      case 'RATE_LIMIT':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
      case 'SERVER_ERROR':
      case 'DB_ERROR':
        return { icon: ServerCrash, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-red-400',
          bg: 'bg-red-400/10 border-red-400/20',
        };
    }
  }
  return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
}

function getMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function ErrorDisplay({ error, onRetry, compact = false, className }: ErrorDisplayProps) {
  if (!error) return null;
  const { icon: Icon, color, bg } = getConfig(error);
  const message = getMessage(error);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2.5 p-3 rounded-2xl border ${bg} backdrop-blur-md ${className}`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
        <p className="text-sm">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto shrink-0"
            onClick={onRetry}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center text-center gap-3 p-6 rounded-2xl border ${bg} backdrop-blur-md ${className}`}
    >
      <Icon className={`h-8 w-8 ${color}`} />
      <p className="text-sm font-medium max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 mt-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
