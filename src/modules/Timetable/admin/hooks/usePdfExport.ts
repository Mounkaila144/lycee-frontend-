import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { pdfExportService } from '../services';
import type { PdfExportOptions } from '../../types';

export const useGeneratePdf = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: PdfExportOptions) => pdfExportService.generatePdf(data, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdf-export-history'] });
    },
  });
};

export const usePdfJobStatus = (jobId: string, tenantId?: string) => {
  return useQuery({
    queryKey: ['pdf-job', jobId],
    queryFn: () => pdfExportService.getJobStatus(jobId, tenantId),
    enabled: !!jobId,
    refetchInterval: 2000,
  });
};

export const usePdfExportHistory = (tenantId?: string) => {
  return useQuery({
    queryKey: ['pdf-export-history'],
    queryFn: () => pdfExportService.getExportHistory(tenantId),
  });
};

export const useDeletePdfExport = (tenantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (exportId: number) => pdfExportService.deleteExport(exportId, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdf-export-history'] });
    },
  });
};
