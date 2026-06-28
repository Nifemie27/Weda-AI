'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LocalTimeProps {
  timezoneOffset: number;
  className?: string;
}

export function LocalTime({ timezoneOffset, className }: LocalTimeProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const local = new Date(utc + timezoneOffset * 1000);
      setTime(
        local.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezoneOffset]);

  if (!time) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <Clock className="h-3.5 w-3.5" />
      <span className="tabular-nums font-medium">{time}</span>
      <span className="text-foreground/50 text-xs">local</span>
    </div>
  );
}
