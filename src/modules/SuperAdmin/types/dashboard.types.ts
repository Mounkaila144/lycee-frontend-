export interface SuperAdminDashboardSchool {
  id: string;
  company_name: string | null;
  is_active: boolean;
  domains: string[];
  created_at: string | null;
  database: string;
  available: boolean;
  students: number | null;
  teachers: number | null;
  users: number | null;
  error: string | null;
}

export type SuperAdminRecentTenant = Pick<
  SuperAdminDashboardSchool,
  'id' | 'company_name' | 'is_active' | 'domains' | 'created_at'
>;

export interface SuperAdminDashboardData {
  tenants: { total: number; active: number; inactive: number };
  domains: { total: number };
  totals: { students: number; teachers: number; users: number; unavailable_schools: number };
  schools: SuperAdminDashboardSchool[];
  recent_tenants: SuperAdminRecentTenant[];
}

export interface SuperAdminDashboardResponse {
  success: boolean;
  data: SuperAdminDashboardData;
}
