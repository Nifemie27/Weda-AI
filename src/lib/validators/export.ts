import { z } from 'zod';

export const exportRequestSchema = z.object({
  format: z.enum(['JSON', 'CSV', 'PDF', 'MARKDOWN']),
  exportType: z.enum(['WEATHER_SEARCH', 'TRIP', 'SEARCH_HISTORY', 'TRIP_HISTORY', 'COMPARISON']),
  recordId: z.string().optional(),
});

export type ExportRequest = z.infer<typeof exportRequestSchema>;
