'use client';

interface WeatherBackgroundProps {
  condition?: string;
  isDay?: boolean;
  children: React.ReactNode;
}

const gradients: Record<string, string> = {
  Clear:
    'from-sky-400 via-blue-300 to-amber-200 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900',
  Clouds:
    'from-slate-300 via-blue-200 to-gray-300 dark:from-slate-800 dark:via-gray-800 dark:to-slate-700',
  Rain: 'from-slate-400 via-blue-300 to-gray-400 dark:from-slate-900 dark:via-blue-900 dark:to-gray-800',
  Drizzle:
    'from-slate-300 via-blue-200 to-gray-300 dark:from-slate-800 dark:via-blue-900 dark:to-gray-800',
  Thunderstorm:
    'from-gray-500 via-slate-400 to-purple-300 dark:from-gray-900 dark:via-slate-900 dark:to-purple-900',
  Snow: 'from-blue-100 via-white to-sky-200 dark:from-slate-800 dark:via-blue-900 dark:to-slate-700',
  Mist: 'from-gray-300 via-slate-200 to-gray-300 dark:from-gray-800 dark:via-slate-800 dark:to-gray-700',
  Fog: 'from-gray-400 via-slate-300 to-gray-400 dark:from-gray-800 dark:via-slate-800 dark:to-gray-700',
  Haze: 'from-amber-300 via-orange-200 to-yellow-200 dark:from-amber-900 dark:via-orange-900 dark:to-slate-800',
  night:
    'from-indigo-800 via-blue-900 to-slate-900 dark:from-indigo-950 dark:via-slate-950 dark:to-gray-950',
  default:
    'from-sky-300 via-blue-200 to-cyan-200 dark:from-slate-800 dark:via-gray-800 dark:to-slate-700',
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
