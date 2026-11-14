import { createApiClient } from '@/shared/lib/api-client';
import type { SuperAdminDashboardData, SuperAdminDashboardResponse } from '../types/dashboard.types';

/**
 * Statistiques du tableau de bord super-admin
 * GET /superadmin/dashboard
 */
export const superAdminDashboardService = {
  async getDashboard(): Promise<SuperAdminDashboardData> {
    const client = createApiClient();
    const response = await client.get<SuperAdminDashboardResponse>('/superadmin/dashboard');

    return response.data.data;
  },
};
