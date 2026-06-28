import { z } from 'zod';

const locationSchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  snapshot: z.record(z.string(), z.unknown()),
});

export const createComparisonSchema = z.object({
  locationA: locationSchema,
  locationB: locationSchema,
});

export type CreateComparisonInput = z.infer<typeof createComparisonSchema>;
