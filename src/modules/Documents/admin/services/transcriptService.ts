import { createApiClient } from '@/shared/lib/api-client';

import type {
  Transcript,
  GenerateTranscriptRequest,
  BatchTranscriptRequest,
  TranscriptFilters,
  TranscriptStatistics,
  PaginatedResponse,
} from '../../types';

class TranscriptService {
  private baseUrl = '/admin/documents/transcripts';

  async getTranscripts(
    filters?: TranscriptFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<Transcript>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Transcript>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getTranscript(
    transcriptId: number,
    tenantId?: string,
  ): Promise<Transcript> {
    const client = createApiClient(tenantId);
    const response = await client.get<Transcript>(
      `${this.baseUrl}/${transcriptId}`,
    );

    return response.data;
  }

  async generateSemester(
    data: GenerateTranscriptRequest,
    tenantId?: string,
  ): Promise<Transcript> {
    const client = createApiClient(tenantId);
    const response = await client.post<Transcript>(
      `${this.baseUrl}/semester`,
      data,
    );

    return response.data;
  }

  async generateGlobal(
    data: GenerateTranscriptRequest,
    tenantId?: string,
  ): Promise<Transcript> {
    const client = createApiClient(tenantId);
    const response = await client.post<Transcript>(
      `${this.baseUrl}/global`,
      data,
    );

    return response.data;
  }

  async generateBatch(
    data: BatchTranscriptRequest,
    tenantId?: string,
  ): Promise<{ message: string; count: number }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; count: number }>(
      `${this.baseUrl}/batch`,
      data,
    );

    return response.data;
  }

  async downloadTranscript(
    transcriptId: number,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/${transcriptId}/download`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  async validateTranscript(
    transcriptId: number,
    tenantId?: string,
  ): Promise<{ message: string; transcript: Transcript }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; transcript: Transcript }>(
      `${this.baseUrl}/${transcriptId}/validate`,
    );

    return response.data;
  }

  async getStatistics(
    tenantId?: string,
  ): Promise<TranscriptStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<TranscriptStatistics>(
      `${this.baseUrl}/statistics`,
    );

    return response.data;
  }
}

export const transcriptService = new TranscriptService();
