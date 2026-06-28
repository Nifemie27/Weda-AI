import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import type { WeatherSearch, Trip } from '@/generated/prisma/client';

type ExportableRecord = WeatherSearch | Trip;

export function toJSON(data: ExportableRecord | ExportableRecord[]): string {
  return JSON.stringify(data, null, 2);
}

export function toCSV(data: ExportableRecord[]): string {
  if (data.length === 0) return '';

  const flattened = data.map((record) => {
    const flat: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (value instanceof Date) {
        flat[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        flat[key] = JSON.stringify(value);
      } else {
        flat[key] = value;
      }
    }
    return flat;
  });

  return Papa.unparse(flattened);
}

export function toMarkdown(data: ExportableRecord | ExportableRecord[], title: string): string {
  const records = Array.isArray(data) ? data : [data];
  const lines: string[] = [`# ${title}`, '', `*Exported on ${new Date().toISOString()}*`, ''];

  for (const record of records) {
    lines.push('---', '');
    for (const [key, value] of Object.entries(record)) {
      if (value instanceof Date) {
        lines.push(`- **${key}**: ${value.toISOString()}`);
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`- **${key}**: \`${JSON.stringify(value)}\``);
      } else {
        lines.push(`- **${key}**: ${value}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function toPDF(data: ExportableRecord | ExportableRecord[], title: string): Buffer {
  const doc = new jsPDF();
  const records = Array.isArray(data) ? data : [data];

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleDateString()}`, 14, 28);

  let y = 38;
  const pageHeight = doc.internal.pageSize.height;

  for (const record of records) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const displayTitle =
      'city' in record ? (record as WeatherSearch).city : (record as Trip).destination;
    doc.text(String(displayTitle), 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    for (const [key, value] of Object.entries(record)) {
      if (key === 'forecastSnapshot' || key === 'weatherSnapshot') continue;
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }

      const displayValue =
        value instanceof Date
          ? value.toISOString()
          : typeof value === 'object' && value !== null
            ? JSON.stringify(value).slice(0, 80)
            : String(value ?? '');

      doc.text(`${key}: ${displayValue}`, 18, y);
      y += 5;
    }

    y += 8;
  }

  return Buffer.from(doc.output('arraybuffer'));
}
