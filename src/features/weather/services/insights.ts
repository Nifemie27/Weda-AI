import {
  TEMPERATURE_THRESHOLDS,
  UV_THRESHOLDS,
  WIND_THRESHOLDS,
  AQI_LABELS,
} from '@/lib/constants';
import type { CurrentWeather, ForecastDay } from '../types';

export interface WeatherInsight {
  category: 'travel' | 'health' | 'activity' | 'packing' | 'warning';
  severity: 'info' | 'caution' | 'warning';
  title: string;
  description: string;
}

export interface TravelConditions {
  driving: { score: number; label: string; notes: string[] };
  walking: { score: number; label: string; notes: string[] };
  cycling: { score: number; label: string; notes: string[] };
  flying: { riskLevel: string; notes: string[] };
  outdoorActivityScore: number;
  weatherRiskScore: number;
  bestTimeToday: string;
}

export function generateInsights(
  current: CurrentWeather,
  forecast: ForecastDay[]
): WeatherInsight[] {
  const insights: WeatherInsight[] = [];

  // Temperature insights
  if (current.temperature >= TEMPERATURE_THRESHOLDS.HOT) {
    insights.push({
      category: 'health',
      severity: 'warning',
      title: 'Extreme heat',
      description: `Temperature is ${current.temperature}°C. Stay hydrated, seek shade, and avoid prolonged outdoor exposure.`,
    });
  } else if (current.temperature >= TEMPERATURE_THRESHOLDS.WARM) {
    insights.push({
      category: 'activity',
      severity: 'info',
      title: 'Warm weather',
      description:
        'Great conditions for outdoor activities. Wear light clothing and apply sunscreen.',
    });
  } else if (current.temperature <= TEMPERATURE_THRESHOLDS.FREEZING) {
    insights.push({
      category: 'health',
      severity: 'warning',
      title: 'Freezing conditions',
      description: `Temperature is ${current.temperature}°C. Wear insulated clothing. Watch for ice on roads and pavements.`,
    });
  } else if (current.temperature <= TEMPERATURE_THRESHOLDS.COLD) {
    insights.push({
      category: 'packing',
      severity: 'caution',
      title: 'Cold weather',
      description: 'Bring warm layers, a coat, and consider gloves and a scarf.',
    });
  }

  // UV insights
  if (current.uvIndex !== undefined) {
    if (current.uvIndex >= UV_THRESHOLDS.VERY_HIGH) {
      insights.push({
        category: 'health',
        severity: 'warning',
        title: 'Very high UV index',
        description: `UV index is ${current.uvIndex}. Apply SPF 30+ sunscreen, wear a hat, and limit midday sun exposure.`,
      });
    } else if (current.uvIndex >= UV_THRESHOLDS.HIGH) {
      insights.push({
        category: 'health',
        severity: 'caution',
        title: 'High UV index',
        description:
          'Apply sunscreen and wear sunglasses. Seek shade during peak hours (10am–4pm).',
      });
    }
  }

  // Air quality insights
  if (current.airQualityIndex !== undefined && current.airQualityIndex >= 4) {
    insights.push({
      category: 'health',
      severity: current.airQualityIndex >= 5 ? 'warning' : 'caution',
      title: `${AQI_LABELS[current.airQualityIndex - 1]} air quality`,
      description:
        'Reduce prolonged outdoor activity. People with respiratory conditions should stay indoors.',
    });
  }

  // Wind insights
  if (current.windSpeed >= WIND_THRESHOLDS.STORM) {
    insights.push({
      category: 'warning',
      severity: 'warning',
      title: 'Storm-force winds',
      description: `Wind speeds of ${current.windSpeed} km/h. Avoid outdoor activities and check for travel disruptions.`,
    });
  } else if (current.windSpeed >= WIND_THRESHOLDS.STRONG) {
    insights.push({
      category: 'warning',
      severity: 'caution',
      title: 'Strong winds',
      description: 'Cycling and outdoor events may be affected. Secure loose items.',
    });
  }

  // Rain insights
  if (current.rain1h && current.rain1h > 5) {
    insights.push({
      category: 'travel',
      severity: 'caution',
      title: 'Heavy rainfall',
      description: 'Carry an umbrella and waterproof jacket. Driving visibility may be reduced.',
    });
  } else if (current.rain1h && current.rain1h > 0) {
    insights.push({
      category: 'packing',
      severity: 'info',
      title: 'Light rain',
      description: 'Bring an umbrella. Conditions are otherwise suitable for outdoor activities.',
    });
  }

  // Visibility insights
  if (current.visibility < 1000) {
    insights.push({
      category: 'warning',
      severity: 'warning',
      title: 'Poor visibility',
      description: 'Visibility below 1km. Avoid driving if possible. Use fog lights if driving.',
    });
  }

  // Forecast-based insights
  if (forecast.length >= 2) {
    const tomorrowRain = forecast[1]?.rainChance;
    if (tomorrowRain && tomorrowRain > 70) {
      insights.push({
        category: 'travel',
        severity: 'caution',
        title: 'Rain expected tomorrow',
        description: `${tomorrowRain}% chance of rain tomorrow. Plan indoor activities or carry rain gear.`,
      });
    }

    const bestDay = forecast.reduce((best, day) =>
      day.rainChance < best.rainChance && day.tempHigh > best.tempHigh ? day : best
    );
    if (bestDay) {
      insights.push({
        category: 'activity',
        severity: 'info',
        title: 'Best day this week',
        description: `${bestDay.date} looks best with ${bestDay.tempHigh}°C and ${bestDay.rainChance}% rain chance.`,
      });
    }
  }

  // Snow insights
  if (current.snow1h && current.snow1h > 0) {
    insights.push({
      category: 'warning',
      severity: 'caution',
      title: 'Snowfall',
      description: 'Snow is falling. Roads may be slippery. Allow extra travel time.',
    });
  }

  // Condition-based insights
  if (current.condition === 'Clear' && current.temperature >= 18 && current.temperature <= 28) {
    insights.push({
      category: 'activity',
      severity: 'info',
      title: 'Perfect sightseeing weather',
      description: 'Clear skies and comfortable temperatures. Ideal for outdoor exploration.',
    });
  }

  return insights;
}

export function calculateTravelConditions(current: CurrentWeather): TravelConditions {
  const drivingNotes: string[] = [];
  const walkingNotes: string[] = [];
  const cyclingNotes: string[] = [];
  const flyingNotes: string[] = [];

  let drivingScore = 100;
  let walkingScore = 100;
  let cyclingScore = 100;
  let outdoorScore = 100;
  let riskScore = 0;

  // Wind impact
  if (current.windSpeed >= WIND_THRESHOLDS.STORM) {
    cyclingScore -= 60;
    drivingScore -= 30;
    walkingScore -= 20;
    outdoorScore -= 40;
    riskScore += 40;
    cyclingNotes.push('Dangerous cycling conditions');
    flyingNotes.push('Possible flight delays');
  } else if (current.windSpeed >= WIND_THRESHOLDS.STRONG) {
    cyclingScore -= 40;
    drivingScore -= 15;
    outdoorScore -= 20;
    riskScore += 20;
    cyclingNotes.push('Difficult cycling conditions');
  } else if (current.windSpeed >= WIND_THRESHOLDS.MODERATE) {
    cyclingScore -= 20;
    outdoorScore -= 10;
    riskScore += 10;
  }

  // Rain impact
  if (current.rain1h && current.rain1h > 5) {
    drivingScore -= 25;
    walkingScore -= 35;
    cyclingScore -= 45;
    outdoorScore -= 30;
    riskScore += 25;
    drivingNotes.push('Reduced visibility, wet roads');
    walkingNotes.push('Carry waterproof gear');
    cyclingNotes.push('Slippery roads');
  } else if (current.rain1h && current.rain1h > 0) {
    drivingScore -= 10;
    walkingScore -= 15;
    cyclingScore -= 20;
    outdoorScore -= 15;
    riskScore += 10;
    walkingNotes.push('Umbrella recommended');
  }

  // Visibility impact
  if (current.visibility < 1000) {
    drivingScore -= 40;
    riskScore += 30;
    drivingNotes.push('Very poor visibility — avoid driving');
  } else if (current.visibility < 5000) {
    drivingScore -= 15;
    riskScore += 10;
    drivingNotes.push('Reduced visibility');
  }

  // Temperature impact
  if (current.temperature <= TEMPERATURE_THRESHOLDS.FREEZING) {
    drivingScore -= 20;
    walkingScore -= 20;
    cyclingScore -= 30;
    outdoorScore -= 25;
    riskScore += 20;
    drivingNotes.push('Risk of ice');
    walkingNotes.push('Watch for icy pavements');
  }

  if (current.temperature >= TEMPERATURE_THRESHOLDS.EXTREME) {
    walkingScore -= 30;
    cyclingScore -= 40;
    outdoorScore -= 35;
    riskScore += 25;
    walkingNotes.push('Extreme heat — limit exposure');
  }

  // Snow impact
  if (current.snow1h && current.snow1h > 0) {
    drivingScore -= 30;
    cyclingScore -= 50;
    riskScore += 30;
    drivingNotes.push('Snow — drive with caution');
    flyingNotes.push('Check for flight disruptions');
  }

  // Thunderstorm
  if (current.condition === 'Thunderstorm') {
    outdoorScore -= 50;
    cyclingScore -= 60;
    riskScore += 40;
    flyingNotes.push('Possible flight delays due to storms');
    walkingNotes.push('Seek shelter immediately');
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const scoreLabel = (score: number) =>
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

  const flyingRisk = riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Moderate' : 'Low';

  // Best time estimate
  let bestTimeToday = 'Anytime';
  if (current.rain1h && current.rain1h > 0) bestTimeToday = 'Early morning or late afternoon';
  if (current.temperature >= TEMPERATURE_THRESHOLDS.HOT) bestTimeToday = 'Early morning or evening';
  if (current.condition === 'Thunderstorm') bestTimeToday = 'Wait for storms to pass';

  return {
    driving: {
      score: clamp(drivingScore),
      label: scoreLabel(clamp(drivingScore)),
      notes: drivingNotes,
    },
    walking: {
      score: clamp(walkingScore),
      label: scoreLabel(clamp(walkingScore)),
      notes: walkingNotes,
    },
    cycling: {
      score: clamp(cyclingScore),
      label: scoreLabel(clamp(cyclingScore)),
      notes: cyclingNotes,
    },
    flying: { riskLevel: flyingRisk, notes: flyingNotes },
    outdoorActivityScore: clamp(outdoorScore),
    weatherRiskScore: clamp(riskScore),
    bestTimeToday,
  };
}

export function generateNaturalLanguageSummary(
  current: CurrentWeather,
  forecast: ForecastDay[]
): string {
  const parts: string[] = [];

  // Current summary
  const feelsLikeDiff = Math.abs(current.temperature - current.feelsLike);
  parts.push(
    `Currently ${current.temperature}°C with ${current.conditionDescription}` +
      (feelsLikeDiff > 3 ? ` (feels like ${current.feelsLike}°C)` : '') +
      '.'
  );

  // Wind
  if (current.windSpeed >= WIND_THRESHOLDS.MODERATE) {
    parts.push(
      `Winds are ${current.windSpeed >= WIND_THRESHOLDS.STRONG ? 'strong' : 'moderate'} at ${current.windSpeed} km/h.`
    );
  }

  // Rain
  if (current.rain1h && current.rain1h > 0) {
    parts.push('Rain is falling — bring an umbrella.');
  }

  // Tomorrow
  if (forecast.length >= 2) {
    const tomorrow = forecast[1];
    parts.push(
      `Tomorrow expect ${tomorrow.conditionDescription} with highs of ${tomorrow.tempHigh}°C` +
        (tomorrow.rainChance > 40 ? ` and a ${tomorrow.rainChance}% chance of rain` : '') +
        '.'
    );
  }

  return parts.join(' ');
}
