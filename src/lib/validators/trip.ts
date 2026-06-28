import { z } from 'zod';

export const createTripSchema = z
  .object({
    destination: z.string().min(1, 'Destination is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    country: z.string().min(1, 'Country is required').max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    notes: z.string().max(5000).optional(),
    packingNotes: z.string().max(5000).optional(),
    isFavourite: z.boolean().default(false),
    weatherSnapshot: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date.',
    path: ['endDate'],
  });

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = z
  .object({
    destination: z.string().min(1).max(200).optional(),
    city: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().max(5000).optional(),
    packingNotes: z.string().max(5000).optional(),
    isFavourite: z.boolean().optional(),
    weatherSnapshot: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be on or after the start date.',
      path: ['endDate'],
    }
  );

export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export const tripListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'startDate', 'destination', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  search: z.string().optional(),
});

export type TripListParams = z.infer<typeof tripListParamsSchema>;
