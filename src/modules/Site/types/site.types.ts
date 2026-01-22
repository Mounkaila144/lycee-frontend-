/**
 * Types pour le module Site (Tenants)
 * Basé sur l'API Tenants de Laravel
 */

/**
 * Domaine associé à un tenant
 */
export interface TenantDomain {
  id: number;
  domain: string;
  tenant_id: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Tenant (Site)
 */
export interface Site {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_logo: string | null;
  is_active: boolean;
  settings: any | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  domains: TenantDomain[];
  created_at: string;
  updated_at: string;
}

/**
 * Item de liste de tenants (pour les tableaux)
 */
export interface SiteListItem {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  is_active: boolean;
  domains: TenantDomain[];
  created_at: string;
  updated_at: string;
}

/**
 * Données pour créer un tenant
 */
export interface CreateSiteData {
  id: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  is_active?: boolean;
  domains: {
    domain: string;
  }[];
}

/**
 * Données pour mettre à jour un tenant
 */
export interface UpdateSiteData {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  is_active?: boolean;
  domains?: {
    domain: string;
  }[];
}

/**
 * Données pour ajouter un domaine
 */
export interface AddDomainData {
  domain: string;
  is_primary?: boolean;
}

/**
 * Filtres pour la liste des tenants
 */
export interface SiteFilters {
  search?: string;
  per_page?: number;
  page?: number;
}

/**
 * Métadonnées de pagination
 */
export interface SitePaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Liens de pagination
 */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/**
 * Réponse de liste des tenants
 */
export interface SitesListResponse {
  data: SiteListItem[];
  links: PaginationLinks;
  meta: SitePaginationMeta;
}

/**
 * Réponse pour un tenant unique
 */
export interface SiteResponse {
  message?: string;
  tenant: Site;
}

/**
 * Réponse pour la création/modification de tenant
 */
export interface TenantMutationResponse {
  message: string;
  tenant: Site;
}

/**
 * Réponse pour la suppression
 */
export interface DeleteResponse {
  message: string;
}

/**
 * Statistiques des tenants (à implémenter côté backend si nécessaire)
 */
export interface SiteStatistics {
  total: number;
  active: number;
  inactive: number;
}
