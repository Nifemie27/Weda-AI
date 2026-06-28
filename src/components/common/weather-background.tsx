'use client';

interface WeatherBackgroundProps {
  condition?: string;
  isDay?: boolean;
  children: React.ReactNode;
}

const gradients: Record<string, string> = {
  Clear:
    'from-sky-100 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950',
  Clouds:
    'from-gray-100 via-slate-100 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800',
  Rain: 'from-slate-200 via-blue-100 to-gray-200 dark:from-slate-950 dark:via-blue-950 dark:to-gray-900',
  Drizzle:
    'from-slate-100 via-blue-50 to-gray-100 dark:from-slate-900 dark:via-blue-950 dark:to-gray-900',
  Thunderstorm:
    'from-gray-300 via-slate-200 to-purple-100 dark:from-gray-950 dark:via-slate-950 dark:to-purple-950',
  Snow: 'from-blue-50 via-white to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800',
  Mist: 'from-gray-100 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800',
  Fog: 'from-gray-200 via-slate-100 to-gray-200 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800',
  Haze: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-slate-900',
  night:
    'from-indigo-100 via-blue-100 to-slate-100 dark:from-indigo-950 dark:via-slate-950 dark:to-gray-950',
  default:
    'from-blue-50 via-white to-sky-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800',
};

export function WeatherBackground({ condition, isDay = true, children }: WeatherBackgroundProps) {
  if (!condition) return <>{children}</>;

  const key = !isDay ? 'night' : condition in gradients ? condition : 'default';
  const gradient = gradients[key] || gradients.default;

  return (
    <div
      className={`min-h-full overflow-x-hidden transition-colors duration-1000 bg-gradient-to-br ${gradient}`}
    >
      {children}
    </div>
  );
}
