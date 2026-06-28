import { z } from 'zod';

export const weatherSearchQuerySchema = z
  .object({
    q: z.string().min(1).max(200).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional(),
    zip: z.string().max(20).optional(),
  })
  .refine((data) => data.q || (data.lat !== undefined && data.lon !== undefined) || data.zip, {
    message: 'Provide a city name (q), coordinates (lat & lon), or a postal code (zip).',
  });

export type WeatherSearchQuery = z.infer<typeof weatherSearchQuerySchema>;

export const weatherSearchHistoryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'city', 'temperature']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type WeatherSearchHistoryParams = z.infer<typeof weatherSearchHistoryParamsSchema>;
