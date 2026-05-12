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
};
