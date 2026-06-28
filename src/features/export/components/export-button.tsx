'use client';

import { Download, FileJson, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExport } from '../hooks/use-export';

type ExportFormat = 'JSON' | 'CSV' | 'PDF' | 'MARKDOWN';
type ExportType = 'WEATHER_SEARCH' | 'TRIP' | 'SEARCH_HISTORY' | 'TRIP_HISTORY' | 'COMPARISON';

interface ExportButtonProps {
  exportType: ExportType;
  recordId?: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const formatConfig: { format: ExportFormat; label: string; icon: typeof FileJson }[] = [
  { format: 'JSON', label: 'JSON', icon: FileJson },
  { format: 'CSV', label: 'CSV', icon: FileSpreadsheet },
  { format: 'PDF', label: 'PDF', icon: FileType },
  { format: 'MARKDOWN', label: 'Markdown', icon: FileText },
];

export function ExportButton({
  exportType,
  recordId,
  label = 'Export',
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const exportMutation = useExport();

  const handleExport = (format: ExportFormat) => {
    exportMutation.mutate({ format, exportType, recordId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={variant} size={size} disabled={exportMutation.isPending}>
            <Download className="h-4 w-4 mr-1" />
            {exportMutation.isPending ? 'Exporting...' : label}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {formatConfig.map(({ format, label: formatLabel, icon: Icon }) => (
          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
            <Icon className="h-4 w-4 mr-2" />
            {formatLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
