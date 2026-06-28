'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info, Shield, Car, PersonStanding, Bike, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeatherInsight, TravelConditions } from '../services/insights';

interface WeatherInsightsProps {
  summary: string;
  insights: WeatherInsight[];
  travelConditions: TravelConditions;
}

const severityConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  caution: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  warning: { icon: Shield, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
};

export function WeatherInsights({ summary, insights, travelConditions }: WeatherInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Natural language summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Weather Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Travel conditions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Travel Conditions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TravelScoreCard
            icon={<Car className="h-5 w-5" />}
            label="Driving"
            score={travelConditions.driving.score}
            status={travelConditions.driving.label}
            notes={travelConditions.driving.notes}
          />
          <TravelScoreCard
            icon={<PersonStanding className="h-5 w-5" />}
            label="Walking"
            score={travelConditions.walking.score}
            status={travelConditions.walking.label}
            notes={travelConditions.walking.notes}
          />
          <TravelScoreCard
            icon={<Bike className="h-5 w-5" />}
            label="Cycling"
            score={travelConditions.cycling.score}
            status={travelConditions.cycling.label}
            notes={travelConditions.cycling.notes}
          />
          <TravelScoreCard
            icon={<Plane className="h-5 w-5" />}
            label="Flight Risk"
            score={
              travelConditions.flying.riskLevel === 'Low'
                ? 90
                : travelConditions.flying.riskLevel === 'Moderate'
                  ? 50
                  : 20
            }
            status={travelConditions.flying.riskLevel}
            notes={travelConditions.flying.notes}
          />
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-muted-foreground">
            Best time today: <strong>{travelConditions.bestTimeToday}</strong>
          </span>
          <Badge variant="outline">
            Outdoor Score: {travelConditions.outdoorActivityScore}/100
          </Badge>
        </div>
      </div>

      {/* Insights list */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const config = severityConfig[insight.severity];
              const Icon = config.icon;

              return (
                <motion.div
                  key={`${insight.title}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${config.bg}`}>
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto shrink-0 text-xs capitalize">
                      {insight.category}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TravelScoreCard({
  icon,
  label,
  score,
  status,
  notes,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  status: string;
  notes: string[];
}) {
  const color =
    score >= 80
      ? 'text-green-500'
      : score >= 60
        ? 'text-yellow-500'
        : score >= 40
          ? 'text-orange-500'
          : 'text-red-500';

  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2 text-muted-foreground">{icon}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{score}</p>
        <p className="text-xs font-medium">{status}</p>
        {notes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{notes[0]}</p>
        )}
      </CardContent>
    </Card>
  );
}
