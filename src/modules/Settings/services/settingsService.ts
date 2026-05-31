import { createApiClient } from '@/shared/lib/api-client';
import type { SettingUpsertInput, TenantSetting } from '../types/settings.types';

export const settingsService = {
  async list(category?: string): Promise<TenantSetting[]> {
    const url = category ? `/admin/settings?category=${category}` : '/admin/settings';
    const { data } = await createApiClient().get<{ data: TenantSetting[] }>(url);
    return data.data;
  },

  async get(key: string): Promise<TenantSetting> {
    const { data } = await createApiClient().get<{ data: TenantSetting }>(
      `/admin/settings/${key}`
    );
    return data.data;
  },

  async upsert(input: SettingUpsertInput): Promise<TenantSetting> {
    const { data } = await createApiClient().post<{ data: TenantSetting }>(
      '/admin/settings',
      input
    );
    return data.data;
  },

  async remove(key: string): Promise<void> {
    await createApiClient().delete(`/admin/settings/${key}`);
  },

  async getSchoolProfile(): Promise<SchoolProfile> {
    const { data } = await createApiClient().get<{ data: SchoolProfile }>(
      '/admin/settings/school-profile'
    );
    return data.data;
  },

  async updateSchoolProfile(form: FormData): Promise<SchoolProfile> {
    const { data } = await createApiClient().post<{ data: SchoolProfile }>(
      '/admin/settings/school-profile',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data;
  },
};

export interface SchoolProfile {
  name: string | null;
  nif: string | null;
  rccm: string | null;
  address: string | null;
  city: string | null;
  bp: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
}
