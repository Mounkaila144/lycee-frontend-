import { createApiClient } from '@/shared/lib/api-client';

import type {
  PdfExportOptions,
  PdfExportJob,
  PdfExportHistory,
} from '../../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class PdfExportService {
  private baseUrl = '/admin/timetable/export/pdf';

  async generatePdf(options: PdfExportOptions, tenantId?: string): Promise<PdfExportJob> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<PdfExportJob>>(this.baseUrl, options);

    return response.data.data;
  }

  async getJobStatus(jobId: string, tenantId?: string): Promise<PdfExportJob> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<PdfExportJob>>(
      `${this.baseUrl}/job/${jobId}`,
    );

    return response.data.data;
  }

  async downloadPdf(jobId: string, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/download/${jobId}`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  async getExportHistory(tenantId?: string): Promise<PdfExportHistory[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<PdfExportHistory[]>>(
      `${this.baseUrl}/history`,
    );

    return response.data.data;
  }

  async deleteExport(exportId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/history/${exportId}`);
  }
}

export const pdfExportService = new PdfExportService();
