/**
 * Maquette PDF Service - Génération de maquettes pédagogiques
 */

import { createApiClient } from '@/shared/lib/api-client';
import type {
  MaquetteGenerationOptions,
  MaquetteGenerationResponse,
  MaquettePreviewData,
} from '../../types/maquette.types';

class MaquetteService {
  /**
   * Generate maquette PDF (generates and returns download)
   */
  async generateMaquette(
    programmeId: number,
    options: MaquetteGenerationOptions = {},
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.post(
      `/admin/programmes/${programmeId}/generate-maquette`,
      options,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Preview maquette PDF inline (opens in browser)
   */
  async previewMaquette(
    programmeId: number,
    options: MaquetteGenerationOptions = {},
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.post(
      `/admin/programmes/${programmeId}/preview-maquette`,
      options,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Store maquette PDF and get path (saves to server)
   */
  async storeMaquette(
    programmeId: number,
    options: MaquetteGenerationOptions = {},
    tenantId?: string
  ): Promise<MaquetteGenerationResponse> {
    const client = createApiClient(tenantId);
    const response = await client.post<MaquetteGenerationResponse>(
      `/admin/programmes/${programmeId}/store-maquette`,
      options
    );
    return response.data;
  }

  /**
   * Download saved maquette PDF
   */
  async downloadMaquette(
    programmeId: number,
    filename: string,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `/admin/programmes/${programmeId}/maquette/${filename}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  /**
   * Helper: Trigger browser download
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const maquetteService = new MaquetteService();
