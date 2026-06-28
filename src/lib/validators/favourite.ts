import { z } from 'zod';

export const createFavouriteSchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  state: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  nickname: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  lastWeatherSnapshot: z.record(z.string(), z.unknown()).optional(),
});

export type CreateFavouriteInput = z.infer<typeof createFavouriteSchema>;

export const updateFavouriteSchema = z.object({
  nickname: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  lastWeatherSnapshot: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateFavouriteInput = z.infer<typeof updateFavouriteSchema>;
