import { createApiClient } from '@/shared/lib/api-client';
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementAudiencePreview,
  AnnouncementInput,
  AnnouncementListResponse,
} from '../types/announcement.types';

/**
 * Annonces de l'établissement.
 *  - feed : tous les rôles (filtré par audience côté backend) ;
 *  - list/create/update/remove/preview : Administrator | Manager.
 */
export const announcementService = {
  async feed(limit = 20): Promise<Announcement[]> {
    const { data } = await createApiClient().get<{ data: Announcement[] }>('/admin/announcements/feed', {
      params: { limit },
    });

    return data.data ?? [];
  },

  async list(params?: { audience?: AnnouncementAudience; search?: string; page?: number; per_page?: number }): Promise<AnnouncementListResponse> {
    const { data } = await createApiClient().get<AnnouncementListResponse>('/admin/announcements', { params });

    return data;
  },

  async create(input: AnnouncementInput): Promise<Announcement> {
    const { data } = await createApiClient().post<{ data: Announcement }>('/admin/announcements', input);

    return data.data;
  },

  async update(id: number, input: AnnouncementInput): Promise<Announcement> {
    const { data } = await createApiClient().put<{ data: Announcement }>(`/admin/announcements/${id}`, input);

    return data.data;
  },

  async remove(id: number): Promise<void> {
    await createApiClient().delete(`/admin/announcements/${id}`);
  },

  async preview(audience: AnnouncementAudience, classeId: number | null): Promise<AnnouncementAudiencePreview> {
    const { data } = await createApiClient().get<{ data: AnnouncementAudiencePreview }>(
      '/admin/announcements/audience-preview',
      { params: classeId ? { audience, classe_id: classeId } : { audience } }
    );

    return data.data;
  },

  async classes(): Promise<Array<{ id: number; name: string }>> {
    const { data } = await createApiClient().get<{ data: Array<{ id: number; name: string }> }>('/admin/classes', {
      params: { per_page: 200 },
    });

    return data.data ?? [];
  },
};
