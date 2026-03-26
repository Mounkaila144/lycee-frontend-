import { createApiClient } from '@/shared/lib/api-client';

import type {
  Certificate,
  CertificateRequest,
  GenerateCertificateRequest,
  CreateCertificateRequestPayload,
  ApproveCertificateRequestPayload,
  RejectCertificateRequestPayload,
  CertificateFilters,
  CertificateRequestFilters,
  CertificateStatistics,
  PaginatedResponse,
} from '../../types';

class CertificateService {
  private baseUrl = '/admin/documents/certificates';

  async getCertificates(
    filters?: CertificateFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<Certificate>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Certificate>>(
      this.baseUrl,
      { params: filters },
    );

    return response.data;
  }

  async getCertificate(
    certificateId: number,
    tenantId?: string,
  ): Promise<Certificate> {
    const client = createApiClient(tenantId);
    const response = await client.get<Certificate>(
      `${this.baseUrl}/${certificateId}`,
    );

    return response.data;
  }

  async generateCertificate(
    data: GenerateCertificateRequest,
    tenantId?: string,
  ): Promise<Certificate> {
    const client = createApiClient(tenantId);
    const response = await client.post<Certificate>(
      this.baseUrl,
      data,
    );

    return response.data;
  }

  async downloadCertificate(
    certificateId: number,
    tenantId?: string,
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get<Blob>(
      `${this.baseUrl}/${certificateId}/download`,
      { responseType: 'blob' },
    );

    return response.data;
  }

  async getRequests(
    filters?: CertificateRequestFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<CertificateRequest>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<CertificateRequest>>(
      `${this.baseUrl}/requests`,
      { params: filters },
    );

    return response.data;
  }

  async createRequest(
    data: CreateCertificateRequestPayload,
    tenantId?: string,
  ): Promise<CertificateRequest> {
    const client = createApiClient(tenantId);
    const response = await client.post<CertificateRequest>(
      `${this.baseUrl}/requests`,
      data,
    );

    return response.data;
  }

  async approveRequest(
    requestId: number,
    data: ApproveCertificateRequestPayload,
    tenantId?: string,
  ): Promise<{ message: string; request: CertificateRequest }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; request: CertificateRequest }>(
      `${this.baseUrl}/requests/${requestId}/approve`,
      data,
    );

    return response.data;
  }

  async rejectRequest(
    requestId: number,
    data: RejectCertificateRequestPayload,
    tenantId?: string,
  ): Promise<{ message: string; request: CertificateRequest }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; request: CertificateRequest }>(
      `${this.baseUrl}/requests/${requestId}/reject`,
      data,
    );

    return response.data;
  }

  async getStatistics(
    tenantId?: string,
  ): Promise<CertificateStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<CertificateStatistics>(
      `${this.baseUrl}/statistics`,
    );

    return response.data;
  }
}

export const certificateService = new CertificateService();
