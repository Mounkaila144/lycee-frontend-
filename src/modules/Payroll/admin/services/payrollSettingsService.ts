import { createApiClient } from '@/shared/lib/api-client';

import type {
  MessageResponse,
  PayrollSettings,
  PayrollSettingsOverview,
  PayrollSettingsVersion,
  PayrollSimulation,
  PayrollSimulationRequest,
  SavePayrollSettingsRequest,
} from '../../types';

/**
 * Paramètres de paie de l'école (cotisations, barème d'impôt, charges patronales),
 * versionnés par date d'effet, et simulateur de bulletin.
 * Lecture : Administrator, Manager, Comptable — écriture : Administrator, Comptable.
 */
class PayrollSettingsService {
  private baseUrl = '/admin/payroll/settings';

  async getOverview(tenantId?: string): Promise<PayrollSettingsOverview> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PayrollSettingsOverview }>(this.baseUrl);

    return response.data.data;
  }

  async getVersions(tenantId?: string): Promise<PayrollSettingsVersion[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PayrollSettingsVersion[] }>(`${this.baseUrl}/versions`);

    return response.data.data;
  }

  async getDefaults(tenantId?: string): Promise<PayrollSettings> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: PayrollSettings }>(`${this.baseUrl}/defaults`);

    return response.data.data;
  }

  async saveVersion(data: SavePayrollSettingsRequest, tenantId?: string): Promise<MessageResponse<PayrollSettingsVersion>> {
    const client = createApiClient(tenantId);
    const response = await client.post<MessageResponse<PayrollSettingsVersion>>(this.baseUrl, data);

    return response.data;
  }

  async simulate(data: PayrollSimulationRequest, tenantId?: string): Promise<PayrollSimulation> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: PayrollSimulation }>(`${this.baseUrl}/simulate`, data);

    return response.data.data;
  }
}

export const payrollSettingsService = new PayrollSettingsService();
