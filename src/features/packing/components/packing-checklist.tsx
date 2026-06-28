'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, PackageCheck, Shirt, Headphones, Heart, Wrench, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CurrentWeather, ForecastDay } from '@/features/weather/types';
import { generatePackingList, type PackingItem } from '../services/packing-service';

interface PackingChecklistProps {
  current: CurrentWeather;
  forecast: ForecastDay[];
  tripDuration?: number;
}

const categoryIcons = {
  clothing: Shirt,
  accessories: Sparkles,
  gear: Wrench,
  health: Heart,
  tech: Headphones,
};

const priorityColors = {
  essential: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  recommended: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  optional: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export function PackingChecklist({ current, forecast, tripDuration }: PackingChecklistProps) {
  const packingList = useMemo(
    () => generatePackingList(current, forecast, tripDuration),
    [current, forecast, tripDuration]
  );

  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const grouped = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {};
    for (const item of packingList.items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [packingList]);

  const progress =
    packingList.items.length > 0 ? Math.round((checked.size / packingList.items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Smart Packing List</h3>
          <p className="text-sm text-muted-foreground">{packingList.summary}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{progress}%</p>
          <p className="text-xs text-muted-foreground">
            {checked.size}/{packingList.items.length} packed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {Object.entries(grouped).map(([category, items]) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons] || PackageCheck;
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold capitalize">{category}</h4>
              <Badge variant="outline" className="text-xs">
                {items.filter((i) => checked.has(i.item)).length}/{items.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={item.item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.item)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      checked.has(item.item)
                        ? 'bg-muted/30 opacity-60'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked.has(item.item)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {checked.has(item.item) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${checked.has(item.item) ? 'line-through' : ''}`}
                        >
                          {item.item}
                        </span>
                        <Badge className={`text-xs ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {checked.size > 0 && (
        <Button variant="outline" size="sm" onClick={() => setChecked(new Set())}>
          Reset Checklist
        </Button>
      )}
    </div>
  );
}
