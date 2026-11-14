import { createApiClient } from '@/shared/lib/api-client';
import type {
  SchoolImageKind,
  SchoolProfile,
  SchoolProfileInput,
  SettingUpsertInput,
  TenantSetting,
} from '../types/settings.types';

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

  /** Profil de l'établissement (nom, en-tête officiel, coordonnées…). */
  async getSchoolProfile(): Promise<SchoolProfile> {
    const { data } = await createApiClient().get<{ data: SchoolProfile }>(
      '/admin/settings/school-profile'
    );

    
return data.data;
  },

  async updateSchoolProfile(input: Partial<SchoolProfileInput>): Promise<SchoolProfile> {
    const { data } = await createApiClient().put<{ data: SchoolProfile }>(
      '/admin/settings/school-profile',
      input
    );

    
return data.data;
  },

  /** Logo ou cachet en PNG (route authentifiée) → URL objet à révoquer par l'appelant. */
  async fetchSchoolImage(kind: SchoolImageKind): Promise<string> {
    const { data } = await createApiClient().get<Blob>(`/admin/settings/school-profile/${kind}`, {
      responseType: 'blob',
    });

    
return URL.createObjectURL(data);
  },

  async uploadSchoolImage(kind: SchoolImageKind, file: File): Promise<SchoolProfile> {
    const form = new FormData();

    form.append('file', file);

    const { data } = await createApiClient().post<{ data: SchoolProfile }>(
      `/admin/settings/school-profile/${kind}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    
return data.data;
  },

  async deleteSchoolImage(kind: SchoolImageKind): Promise<SchoolProfile> {
    const { data } = await createApiClient().delete<{ data: SchoolProfile }>(
      `/admin/settings/school-profile/${kind}`
    );

    
return data.data;
  },
};
