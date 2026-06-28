import { TEMPERATURE_THRESHOLDS, UV_THRESHOLDS } from '@/lib/constants';
import type { CurrentWeather, ForecastDay } from '@/features/weather/types';

export interface PackingItem {
  item: string;
  category: 'clothing' | 'accessories' | 'gear' | 'health' | 'tech';
  priority: 'essential' | 'recommended' | 'optional';
  reason: string;
}

export interface PackingList {
  destination: string;
  items: PackingItem[];
  summary: string;
}

export function generatePackingList(
  current: CurrentWeather,
  forecast: ForecastDay[],
  tripDuration?: number
): PackingList {
  const items: PackingItem[] = [];

  const maxTemp = Math.max(current.temperature, ...forecast.map((d) => d.tempHigh));
  const minTemp = Math.min(current.temperature, ...forecast.map((d) => d.tempLow));
  const maxRainChance = Math.max(...forecast.map((d) => d.rainChance));
  const maxWind = Math.max(current.windSpeed, ...forecast.map((d) => d.windSpeed));
  const hasSnow = current.snow1h !== undefined && current.snow1h > 0;

  // ── Clothing ──

  if (maxTemp >= TEMPERATURE_THRESHOLDS.HOT) {
    items.push({
      item: 'Lightweight T-shirts',
      category: 'clothing',
      priority: 'essential',
      reason: `Temperatures up to ${Math.round(maxTemp)}°C — light, breathable fabrics are essential.`,
    });
    items.push({
      item: 'Shorts',
      category: 'clothing',
      priority: 'essential',
      reason: 'Hot weather demands light legwear.',
    });
    items.push({
      item: 'Swimsuit',
      category: 'clothing',
      priority: 'recommended',
      reason: 'Great weather for swimming or beach activities.',
    });
  }

  if (maxTemp >= TEMPERATURE_THRESHOLDS.WARM && maxTemp < TEMPERATURE_THRESHOLDS.HOT) {
    items.push({
      item: 'Light layers',
      category: 'clothing',
      priority: 'essential',
      reason: `Warm days (${Math.round(maxTemp)}°C) with cooler evenings (${Math.round(minTemp)}°C).`,
    });
  }

  if (minTemp <= TEMPERATURE_THRESHOLDS.COOL) {
    items.push({
      item: 'Warm sweater or fleece',
      category: 'clothing',
      priority: 'essential',
      reason: `Temperatures drop to ${Math.round(minTemp)}°C — a warm layer is needed.`,
    });
  }

  if (minTemp <= TEMPERATURE_THRESHOLDS.COLD) {
    items.push({
      item: 'Winter coat',
      category: 'clothing',
      priority: 'essential',
      reason: `Cold temperatures of ${Math.round(minTemp)}°C require a proper coat.`,
    });
    items.push({
      item: 'Thermal underwear',
      category: 'clothing',
      priority: 'recommended',
      reason: 'Base layers help retain body heat in cold conditions.',
    });
  }

  if (minTemp <= TEMPERATURE_THRESHOLDS.FREEZING) {
    items.push({
      item: 'Insulated gloves',
      category: 'accessories',
      priority: 'essential',
      reason: 'Freezing temperatures — protect your hands.',
    });
    items.push({
      item: 'Warm hat / beanie',
      category: 'accessories',
      priority: 'essential',
      reason: 'Significant heat loss occurs through the head in freezing weather.',
    });
    items.push({
      item: 'Scarf',
      category: 'accessories',
      priority: 'recommended',
      reason: 'Protect your neck and face from cold wind.',
    });
  }

  // ── Rain gear ──

  if (maxRainChance > 50) {
    items.push({
      item: 'Waterproof jacket',
      category: 'gear',
      priority: 'essential',
      reason: `${maxRainChance}% rain chance — a waterproof layer is essential.`,
    });
    items.push({
      item: 'Umbrella',
      category: 'accessories',
      priority: 'essential',
      reason: 'High likelihood of rain during your trip.',
    });
    items.push({
      item: 'Waterproof shoes/boots',
      category: 'clothing',
      priority: 'recommended',
      reason: 'Keep feet dry in wet conditions.',
    });
  } else if (maxRainChance > 20) {
    items.push({
      item: 'Compact umbrella',
      category: 'accessories',
      priority: 'recommended',
      reason: `${maxRainChance}% chance of rain — carry one just in case.`,
    });
    items.push({
      item: 'Light rain jacket',
      category: 'clothing',
      priority: 'recommended',
      reason: 'A packable rain layer for unexpected showers.',
    });
  }

  // ── Snow gear ──

  if (hasSnow) {
    items.push({
      item: 'Snow boots',
      category: 'clothing',
      priority: 'essential',
      reason: 'Active snowfall — waterproof insulated boots are necessary.',
    });
  }

  // ── Sun protection ──

  if (current.uvIndex !== undefined && current.uvIndex >= UV_THRESHOLDS.MODERATE) {
    items.push({
      item: 'Sunscreen (SPF 30+)',
      category: 'health',
      priority: 'essential',
      reason: `UV index of ${current.uvIndex} — protect your skin.`,
    });
    items.push({
      item: 'Sunglasses',
      category: 'accessories',
      priority: 'essential',
      reason: 'UV protection for your eyes.',
    });
  }

  if (current.uvIndex !== undefined && current.uvIndex >= UV_THRESHOLDS.HIGH) {
    items.push({
      item: 'Wide-brimmed hat',
      category: 'accessories',
      priority: 'recommended',
      reason: 'High UV — shade your face and neck.',
    });
  }

  // ── Wind gear ──

  if (maxWind >= 30) {
    items.push({
      item: 'Windbreaker',
      category: 'clothing',
      priority: 'recommended',
      reason: `Winds up to ${Math.round(maxWind)} km/h — wind protection needed.`,
    });
  }

  // ── Air quality ──

  if (current.airQualityIndex !== undefined && current.airQualityIndex >= 4) {
    items.push({
      item: 'N95 / KN95 mask',
      category: 'health',
      priority: 'recommended',
      reason: 'Poor air quality — protect your respiratory health.',
    });
  }

  // ── Universal items ──

  items.push({
    item: 'Comfortable walking shoes',
    category: 'clothing',
    priority: 'essential',
    reason: 'Essential for exploring any destination.',
  });

  items.push({
    item: 'Water bottle',
    category: 'gear',
    priority: 'essential',
    reason: 'Stay hydrated throughout your trip.',
  });

  items.push({
    item: 'Portable charger',
    category: 'tech',
    priority: 'recommended',
    reason: 'Keep devices charged for maps, photos, and communication.',
  });

  if (tripDuration && tripDuration > 3) {
    items.push({
      item: 'First aid kit',
      category: 'health',
      priority: 'recommended',
      reason: `${tripDuration}-day trip — carry basic medical supplies.`,
    });
  }

  // Build summary
  const conditions: string[] = [];
  if (maxTemp >= TEMPERATURE_THRESHOLDS.HOT) conditions.push('hot');
  else if (maxTemp >= TEMPERATURE_THRESHOLDS.WARM) conditions.push('warm');
  else if (minTemp <= TEMPERATURE_THRESHOLDS.FREEZING) conditions.push('freezing');
  else if (minTemp <= TEMPERATURE_THRESHOLDS.COLD) conditions.push('cold');
  else conditions.push('mild');

  if (maxRainChance > 50) conditions.push('rainy');
  if (hasSnow) conditions.push('snowy');
  if (maxWind >= 30) conditions.push('windy');

  const summary = `Pack for ${conditions.join(', ')} conditions. Temperatures range from ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C.${
    tripDuration ? ` Trip duration: ${tripDuration} days.` : ''
  }`;

  return {
    destination: current.location.city,
    items,
    summary,
  };
}
