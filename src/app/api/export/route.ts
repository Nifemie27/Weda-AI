import { type NextRequest } from 'next/server';
import { errorResponse, withErrorHandling, getDeviceIdFromHeaders } from '@/lib/api-helpers';
import { exportRequestSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { toJSON, toCSV, toMarkdown, toPDF, toXML } from '@/features/export/services/export-service';
import type { WeatherSearch, Trip } from '@/generated/prisma/client';

type ExportableRecord = WeatherSearch | Trip;

const CONTENT_TYPES: Record<string, string> = {
  JSON: 'application/json',
  CSV: 'text/csv',
  PDF: 'application/pdf',
  MARKDOWN: 'text/markdown',
  XML: 'application/xml',
};

const EXTENSIONS: Record<string, string> = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf',
  MARKDOWN: 'md',
  XML: 'xml',
};

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const parsed = exportRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 400);
    }

    const { format, exportType, recordId } = parsed.data;
    const deviceId = getDeviceIdFromHeaders(request.headers);

    const { data, title } = await fetchExportData(exportType, recordId, deviceId);

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return errorResponse('NO_DATA', 'No records found to export.', 404);
    }

    const records: ExportableRecord[] = Array.isArray(data) ? data : [data];

    let content: string | ArrayBuffer;

    switch (format) {
      case 'JSON':
        content = toJSON(data);
        break;
      case 'CSV':
        content = toCSV(records);
        break;
      case 'MARKDOWN':
        content = toMarkdown(data, title);
        break;
      case 'XML':
        content = toXML(data, title.toLowerCase().replace(/\s+/g, '_'));
        break;
      case 'PDF': {
        const buf = toPDF(data, title);
        content = new ArrayBuffer(buf.byteLength);
        new Uint8Array(content).set(buf);
        break;
      }
    }

    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${EXTENSIONS[format]}`;

    await prisma.exportHistory
      .create({
        data: {
          deviceId,
          format,
          exportType,
          recordId,
          recordCount: records.length,
          fileName,
        },
      })
      .catch((err: unknown) => console.error('Failed to log export:', err));

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': CONTENT_TYPES[format],
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  });
}

async function fetchExportData(
  exportType: string,
  recordId: string | undefined,
  deviceId: string
): Promise<{ data: ExportableRecord | ExportableRecord[] | null; title: string }> {
  switch (exportType) {
    case 'WEATHER_SEARCH': {
      if (recordId) {
        const record = await prisma.weatherSearch.findFirst({
          where: { id: recordId, deviceId },
        });
        return { data: record, title: `Weather Search - ${record?.city || 'Unknown'}` };
      }
      return { data: null, title: '' };
    }
    case 'SEARCH_HISTORY': {
      const records = await prisma.weatherSearch.findMany({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
      return { data: records, title: 'Weather Search History' };
    }
    case 'TRIP': {
      if (recordId) {
        const record = await prisma.trip.findFirst({
          where: { id: recordId, deviceId },
        });
        return { data: record, title: `Trip - ${record?.destination || 'Unknown'}` };
      }
      return { data: null, title: '' };
    }
    case 'TRIP_HISTORY': {
      const records = await prisma.trip.findMany({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });
      return { data: records, title: 'Trip History' };
    }
    case 'COMPARISON': {
      if (recordId) {
        const record = await prisma.weatherComparison.findUnique({ where: { id: recordId } });
        if (record) {
          return {
            data: null,
            title: `Comparison - ${record.locationACity} vs ${record.locationBCity}`,
          };
        }
      }
      return { data: null, title: '' };
    }
    default:
      return { data: null, title: '' };
  }
}
