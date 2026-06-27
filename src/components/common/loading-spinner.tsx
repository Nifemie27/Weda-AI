import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

export function LoadingSpinner({
  className,
  size = 24,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} role="status">
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
