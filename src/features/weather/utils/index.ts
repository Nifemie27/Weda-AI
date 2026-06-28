export function getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

export function formatWindSpeed(speed: number): string {
  return `${Math.round(speed)} km/h`;
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function formatPressure(hPa: number): string {
  return `${hPa} hPa`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTime(isoString: string, timezoneOffset: number): string {
  const date = new Date(isoString);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const local = new Date(utc + timezoneOffset * 1000);
  return local.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}
