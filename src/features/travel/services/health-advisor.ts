import { TEMPERATURE_THRESHOLDS, UV_THRESHOLDS, AQI_LABELS } from '@/lib/constants';
import type { CurrentWeather, ForecastDay } from '@/features/weather/types';

export interface HealthAdvice {
  category: 'uv' | 'air' | 'temperature' | 'hydration' | 'allergen' | 'general';
  severity: 'info' | 'caution' | 'warning';
  title: string;
  advice: string;
  icon: string;
}

export function generateHealthAdvice(
  current: CurrentWeather,
  forecast: ForecastDay[]
): HealthAdvice[] {
  const advice: HealthAdvice[] = [];

  // UV protection
  if (current.uvIndex !== undefined) {
    if (current.uvIndex >= UV_THRESHOLDS.VERY_HIGH) {
      advice.push({
        category: 'uv',
        severity: 'warning',
        title: 'Extreme UV exposure risk',
        advice:
          'Apply SPF 50+ sunscreen every 2 hours. Wear a wide-brimmed hat and UV-protective sunglasses. Avoid direct sun between 10am and 4pm.',
        icon: '☀️',
      });
    } else if (current.uvIndex >= UV_THRESHOLDS.HIGH) {
      advice.push({
        category: 'uv',
        severity: 'caution',
        title: 'High UV levels',
        advice:
          'Apply SPF 30+ sunscreen before going outdoors. Wear sunglasses and seek shade during midday hours.',
        icon: '🧴',
      });
    } else if (current.uvIndex >= UV_THRESHOLDS.MODERATE) {
      advice.push({
        category: 'uv',
        severity: 'info',
        title: 'Moderate UV',
        advice: 'Sunscreen recommended for extended outdoor activity. Sunglasses advisable.',
        icon: '😎',
      });
    }
  }

  // Air quality
  if (current.airQualityIndex !== undefined) {
    if (current.airQualityIndex >= 4) {
      advice.push({
        category: 'air',
        severity: 'warning',
        title: `${AQI_LABELS[current.airQualityIndex - 1]} air quality`,
        advice:
          'Limit prolonged outdoor exertion. People with asthma or respiratory conditions should stay indoors. Consider wearing an N95 mask if outdoors.',
        icon: '😷',
      });
    } else if (current.airQualityIndex === 3) {
      advice.push({
        category: 'air',
        severity: 'caution',
        title: 'Moderate air quality',
        advice:
          'Sensitive individuals should reduce prolonged outdoor activity. Keep windows closed if possible.',
        icon: '🌫️',
      });
    }
  }

  // Heat
  if (current.temperature >= TEMPERATURE_THRESHOLDS.EXTREME) {
    advice.push({
      category: 'temperature',
      severity: 'warning',
      title: 'Dangerous heat',
      advice:
        'Risk of heat stroke. Stay in air-conditioned spaces. Drink water every 15–20 minutes. Avoid outdoor activity. Wear loose, light-coloured clothing.',
      icon: '🥵',
    });
  } else if (current.temperature >= TEMPERATURE_THRESHOLDS.HOT) {
    advice.push({
      category: 'hydration',
      severity: 'caution',
      title: 'Stay hydrated',
      advice:
        'Drink at least 2–3 litres of water throughout the day. Take breaks in shade. Avoid caffeine and alcohol which increase dehydration.',
      icon: '💧',
    });
  }

  // Cold
  if (current.temperature <= TEMPERATURE_THRESHOLDS.FREEZING) {
    advice.push({
      category: 'temperature',
      severity: 'warning',
      title: 'Frostbite risk',
      advice:
        'Cover all exposed skin. Wear insulated, waterproof layers. Limit time outdoors. Watch for numbness in fingers, toes, nose, and ears.',
      icon: '🥶',
    });
  } else if (current.temperature <= TEMPERATURE_THRESHOLDS.COLD) {
    advice.push({
      category: 'temperature',
      severity: 'caution',
      title: 'Cold weather precautions',
      advice:
        'Dress in warm layers. Wear a hat and gloves. Keep moving to maintain body heat. Warm drinks recommended.',
      icon: '🧥',
    });
  }

  // Humidity
  if (current.humidity >= 80 && current.temperature >= TEMPERATURE_THRESHOLDS.WARM) {
    advice.push({
      category: 'general',
      severity: 'caution',
      title: 'High humidity',
      advice:
        'High humidity makes heat feel worse. Wear breathable, moisture-wicking fabrics. Take frequent breaks. Watch for signs of heat exhaustion.',
      icon: '🌡️',
    });
  }

  // Rain and wet conditions
  if (current.rain1h && current.rain1h > 0) {
    advice.push({
      category: 'general',
      severity: 'info',
      title: 'Wet conditions',
      advice:
        'Wear waterproof footwear to avoid blisters from wet shoes. Carry a change of socks if hiking. Watch for slippery surfaces.',
      icon: '🌧️',
    });
  }

  // General hydration in warm weather
  if (
    current.temperature >= TEMPERATURE_THRESHOLDS.COMFORTABLE &&
    current.temperature < TEMPERATURE_THRESHOLDS.HOT &&
    advice.every((a) => a.category !== 'hydration')
  ) {
    advice.push({
      category: 'hydration',
      severity: 'info',
      title: 'Hydration reminder',
      advice: 'Carry a water bottle. Aim for 1.5–2 litres per day, more if physically active.',
      icon: '🚰',
    });
  }

  // Upcoming weather changes
  if (forecast.length >= 2) {
    const tempDrop = current.temperature - forecast[1].tempLow;
    if (tempDrop > 10) {
      advice.push({
        category: 'general',
        severity: 'caution',
        title: 'Significant temperature drop ahead',
        advice: `Temperature may drop by ${Math.round(tempDrop)}°C tomorrow. Pack an extra layer to avoid getting caught in the cold.`,
        icon: '📉',
      });
    }
  }

  return advice;
}
