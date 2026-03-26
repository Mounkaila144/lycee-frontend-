import { createApiClient } from '@/shared/lib/api-client';

import type {
  DocumentVerification,
  ElectronicSignature,
  Archive,
  DocumentRegister,
  VerifyDocumentRequest,
  CreateSignatureRequest,
  VerificationFilters,
  VerificationStatistics,
  PaginatedResponse,
} from '../../types';

class VerificationService {
  private baseUrl = '/admin/documents/verification';

  async verifyByQrCode(
    data: VerifyDocumentRequest,
    tenantId?: string,
  ): Promise<DocumentVerification> {
    const client = createApiClient(tenantId);
    const response = await client.post<DocumentVerification>(
      `${this.baseUrl}/qr-code`,
      data,
    );

    return response.data;
  }

  async verifyByDocumentNumber(
    data: VerifyDocumentRequest,
    tenantId?: string,
  ): Promise<DocumentVerification> {
    const client = createApiClient(tenantId);
    const response = await client.post<DocumentVerification>(
      `${this.baseUrl}/document-number`,
      data,
    );

    return response.data;
  }

  async getVerificationHistory(
    filters?: VerificationFilters,
    tenantId?: string,
  ): Promise<PaginatedResponse<DocumentVerification>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<DocumentVerification>>(
      `${this.baseUrl}/history`,
      { params: filters },
    );

    return response.data;
  }

  async getStatistics(
    tenantId?: string,
  ): Promise<VerificationStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<VerificationStatistics>(
      `${this.baseUrl}/statistics`,
    );

    return response.data;
  }

  async getRegister(
    tenantId?: string,
  ): Promise<PaginatedResponse<DocumentRegister>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<DocumentRegister>>(
      `${this.baseUrl}/register`,
    );

    return response.data;
  }

  async getArchives(
    tenantId?: string,
  ): Promise<PaginatedResponse<Archive>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<Archive>>(
      `${this.baseUrl}/archives`,
    );

    return response.data;
  }

  async moveToColdStorage(
    archiveId: number,
    tenantId?: string,
  ): Promise<{ message: string; archive: Archive }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; archive: Archive }>(
      `${this.baseUrl}/archives/${archiveId}/cold-storage`,
    );

    return response.data;
  }

  async getSignatures(
    tenantId?: string,
  ): Promise<PaginatedResponse<ElectronicSignature>> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedResponse<ElectronicSignature>>(
      `${this.baseUrl}/electronic-signatures`,
    );

    return response.data;
  }

  async createSignature(
    data: CreateSignatureRequest,
    tenantId?: string,
  ): Promise<ElectronicSignature> {
    const client = createApiClient(tenantId);
    const response = await client.post<ElectronicSignature>(
      `${this.baseUrl}/electronic-signatures`,
      data,
    );

    return response.data;
  }

  async signDocument(
    signatureId: number,
    tenantId?: string,
  ): Promise<{ message: string; signature: ElectronicSignature }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ message: string; signature: ElectronicSignature }>(
      `${this.baseUrl}/electronic-signatures/${signatureId}/sign`,
    );

    return response.data;
  }
}

export const verificationService = new VerificationService();
