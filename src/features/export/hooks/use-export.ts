'use client';

import { useMutation } from '@tanstack/react-query';
import { getDeviceId } from '@/hooks/use-device-id';

interface ExportParams {
  format: 'JSON' | 'CSV' | 'PDF' | 'MARKDOWN';
  exportType: 'WEATHER_SEARCH' | 'TRIP' | 'SEARCH_HISTORY' | 'TRIP_HISTORY' | 'COMPARISON';
  recordId?: string;
}

export function useExport() {
  return useMutation({
    mutationFn: async (params: ExportParams) => {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': getDeviceId() },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error?.message || 'Export failed');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `export-${Date.now()}`;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { filename };
    },
  });
}
