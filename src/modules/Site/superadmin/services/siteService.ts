import { createApiClient } from '@/shared/lib/api-client';
import {
  Site,
  CreateSiteData,
  UpdateSiteData,
  SiteFilters,
  SitesListResponse,
  SiteResponse,
  TenantMutationResponse,
  DeleteResponse,
  SiteStatistics,
  AddDomainData,
} from '../../types/site.types';

/**
 * Service pour gérer les tenants (Superadmin uniquement)
 * Basé sur l'API Tenants Laravel
 */
class SiteService {
  /**
   * Récupérer la liste des tenants avec filtres et pagination
   */
  async getSites(filters?: SiteFilters): Promise<SitesListResponse> {
    const client = createApiClient();

    const params: Record<string, any> = {};

    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.page) params.page = filters.page;

    const response = await client.get<SitesListResponse>('/superadmin/tenants', { params });
    return response.data;
  }

  /**
   * Récupérer les détails d'un tenant
   */
  async getSite(id: string): Promise<Site> {
    const client = createApiClient();
    const response = await client.get<SiteResponse>(`/superadmin/tenants/${id}`);
    return response.data.tenant;
  }

  /**
   * Créer un nouveau tenant
   */
  async createSite(data: CreateSiteData): Promise<Site> {
    const client = createApiClient();
    const response = await client.post<TenantMutationResponse>('/superadmin/tenants', data);
    return response.data.tenant;
  }

  /**
   * Mettre à jour un tenant
   */
  async updateSite(id: string, data: UpdateSiteData): Promise<Site> {
    const client = createApiClient();
    const response = await client.put<TenantMutationResponse>(`/superadmin/tenants/${id}`, data);
    return response.data.tenant;
  }

  /**
   * Supprimer un tenant
   */
  async deleteSite(id: string): Promise<void> {
    const client = createApiClient();
    await client.delete<DeleteResponse>(`/superadmin/tenants/${id}`);
  }

  /**
   * Activer/désactiver un tenant
   */
  async toggleActive(id: string): Promise<Site> {
    const client = createApiClient();
    const response = await client.post<TenantMutationResponse>(`/superadmin/tenants/${id}/toggle-active`);
    return response.data.tenant;
  }

  /**
   * Ajouter un domaine à un tenant
   */
  async addDomain(tenantId: string, data: AddDomainData): Promise<Site> {
    const client = createApiClient();
    const response = await client.post<TenantMutationResponse>(`/superadmin/tenants/${tenantId}/domains`, data);
    return response.data.tenant;
  }

  /**
   * Supprimer un domaine d'un tenant
   */
  async removeDomain(tenantId: string, domainId: number): Promise<Site> {
    const client = createApiClient();
    const response = await client.delete<TenantMutationResponse>(
      `/superadmin/tenants/${tenantId}/domains/${domainId}`
    );
    return response.data.tenant;
  }

  /**
   * Récupérer les statistiques des tenants
   * Note: Cette méthode peut nécessiter une implémentation côté backend
   */
  async getStatistics(): Promise<SiteStatistics> {
    const client = createApiClient();

    try {
      // Essayer d'abord un endpoint dédié si disponible
      const response = await client.get<{ data: SiteStatistics }>('/superadmin/tenants/statistics');
      return response.data.data;
    } catch {
      // Fallback: calculer les stats à partir de la liste complète
      const tenantsResponse = await this.getSites({ per_page: 1000 });
      const total = tenantsResponse.meta.total;
      const active = tenantsResponse.data.filter(t => t.is_active).length;
      const inactive = total - active;

      return {
        total,
        active,
        inactive,
      };
    }
  }
}

export const siteService = new SiteService();
