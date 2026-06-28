'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface WeatherBgContextValue {
  condition: string | null;
  isDay: boolean;
  setWeatherBg: (condition: string | null, isDay: boolean) => void;
}

const WeatherBgContext = createContext<WeatherBgContextValue>({
  condition: null,
  isDay: true,
  setWeatherBg: () => {},
});

export function WeatherBgProvider({ children }: { children: ReactNode }) {
  const [condition, setCondition] = useState<string | null>(null);
  const [isDay, setIsDay] = useState(true);

  const setWeatherBg = (c: string | null, d: boolean) => {
    setCondition(c);
    setIsDay(d);
  };

  return (
    <WeatherBgContext.Provider value={{ condition, isDay, setWeatherBg }}>
      {children}
    </WeatherBgContext.Provider>
  );
}

export function useWeatherBg() {
  return useContext(WeatherBgContext);
}
