export type AnnouncementAudience = 'all' | 'parents' | 'students' | 'teachers' | 'staff';

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: 'Tout le monde',
  parents: 'Parents',
  students: 'Élèves',
  teachers: 'Professeurs',
  staff: 'Personnel administratif',
};

export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  audience_label: string;
  classe_id: number | null;
  classe: { id: number; name: string } | null;
  published_at: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  is_published: boolean;
  is_expired: boolean;
  author: { id: number; full_name: string } | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  classe_id: number | null;
  published_at: string | null;
  expires_at: string | null;
  is_pinned: boolean;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface AnnouncementAudiencePreview {
  label: string;
  counts: { parents: number; students: number; teachers: number; staff: number };
  total: number;
}
