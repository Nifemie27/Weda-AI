'use client';

import { useEffect, useMemo, useState } from 'react';

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

function seededValues(count: number, seed: number) {
  const values: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 7) % 2147483647;
    values.push((s % 10000) / 10000);
  }
  return values;
}

export function WeatherBackground({ condition, isDay = true, children }: WeatherBackgroundProps) {
  if (!condition) return <>{children}</>;

  const key = !isDay ? 'night' : condition in gradients ? condition : 'default';
  const gradient = gradients[key] || gradients.default;

  return (
    <div
      className={`relative min-h-full overflow-x-hidden transition-colors duration-1000 bg-gradient-to-br ${gradient}`}
    >
      <WeatherEffects condition={condition} isDay={isDay} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function WeatherEffects({ condition, isDay }: { condition: string; isDay: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {condition === 'Clear' && isDay && <SunEffect />}
      {condition === 'Clear' && !isDay && <StarsEffect />}
      {(condition === 'Clouds' ||
        condition === 'Mist' ||
        condition === 'Fog' ||
        condition === 'Haze') && <CloudsEffect />}
      {(condition === 'Rain' || condition === 'Drizzle') && (
        <>
          <CloudsEffect />
          <RainEffect />
        </>
      )}
      {condition === 'Thunderstorm' && (
        <>
          <CloudsEffect dark />
          <RainEffect heavy />
          <LightningEffect />
        </>
      )}
      {condition === 'Snow' && <SnowEffect />}
    </div>
  );
}

function SunEffect() {
  return (
    <>
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-yellow-300/40 dark:bg-yellow-500/10 blur-3xl animate-pulse" />
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-amber-200/50 dark:bg-amber-400/10 blur-2xl" />
    </>
  );
}

function StarsEffect() {
  const stars = useMemo(() => {
    const v = seededValues(150, 42);
    return Array.from({ length: 30 }, (_, i) => ({
      top: v[i * 5] * 60,
      left: v[i * 5 + 1] * 100,
      delay: v[i * 5 + 2] * 3,
      duration: 2 + v[i * 5 + 3] * 3,
      opacity: 0.3 + v[i * 5 + 4] * 0.7,
    }));
  }, []);

  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
          }}
        />
      ))}
      <div className="absolute top-16 left-20 w-20 h-20 rounded-full bg-gray-200/20 blur-sm" />
    </>
  );
}

function CloudsEffect({ dark = false }: { dark?: boolean }) {
  const baseColor = dark ? 'bg-gray-400/20 dark:bg-gray-600/20' : 'bg-white/30 dark:bg-gray-400/10';
  return (
    <>
      <div
        className={`absolute -top-10 left-[10%] w-72 h-24 ${baseColor} rounded-full blur-2xl`}
        style={{ animation: 'drift 25s ease-in-out infinite' }}
      />
      <div
        className={`absolute top-20 left-[50%] w-96 h-28 ${baseColor} rounded-full blur-3xl`}
        style={{ animation: 'drift 35s ease-in-out infinite reverse' }}
      />
      <div
        className={`absolute top-5 left-[75%] w-64 h-20 ${baseColor} rounded-full blur-2xl`}
        style={{ animation: 'drift 30s ease-in-out infinite', animationDelay: '5s' }}
      />
    </>
  );
}

function RainEffect({ heavy = false }: { heavy?: boolean }) {
  const count = heavy ? 60 : 30;
  const drops = useMemo(() => {
    const v = seededValues(count * 4, heavy ? 99 : 77);
    return Array.from({ length: count }, (_, i) => ({
      height: 12 + v[i * 4] * 16,
      left: v[i * 4 + 1] * 100,
      speed: 0.5 + v[i * 4 + 2] * 0.5,
      delay: v[i * 4 + 3] * 2,
    }));
  }, [count, heavy]);

  return (
    <>
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute w-[1px] bg-blue-300/40 dark:bg-blue-400/30 rounded-full"
          style={{
            height: `${d.height}px`,
            left: `${d.left}%`,
            top: '-20px',
            animation: `rainfall ${d.speed}s linear infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function LightningEffect() {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!flash) return null;
  return <div className="absolute inset-0 bg-white/20 dark:bg-white/10 transition-opacity" />;
}

function SnowEffect() {
  const flakes = useMemo(() => {
    const v = seededValues(160, 55);
    return Array.from({ length: 40 }, (_, i) => ({
      left: v[i * 4] * 100,
      speed: 3 + v[i * 4 + 1] * 4,
      delay: v[i * 4 + 2] * 5,
    }));
  }, []);

  return (
    <>
      {flakes.map((f, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/60 dark:bg-white/30 rounded-full"
          style={{
            left: `${f.left}%`,
            top: '-10px',
            animation: `snowfall ${f.speed}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </>
  );
}
