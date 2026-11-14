export interface TenantSetting {
  id: number;
  key: string;
  value: string | null;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'file';
  category: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingUpsertInput {
  key: string;
  value: string | null;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'file';
  category?: string;
  description?: string;
}

export type SchoolType = 'Lycée' | 'CEG' | 'Collège' | 'Complexe scolaire';

export type SchoolImageKind = 'logo' | 'stamp';

/** Champs modifiables du profil de l'établissement (PUT /admin/settings/school-profile). */
export interface SchoolProfileInput {
  name: string | null;
  short_name: string | null;
  type: SchoolType | null;
  motto: string | null;
  official_header: string | null;
  region: string | null;
  inspection: string | null;
  address: string | null;
  city: string | null;
  po_box: string | null;
  phone: string | null;
  phone_secondary: string | null;
  email: string | null;
  website: string | null;
  authorization_number: string | null;
  head_title: string | null;
  head_name: string | null;
  censor_name: string | null;
  country: string | null;
  currency: string | null;
}

/** GET /admin/settings/school-profile (lisible par tous les rôles authentifiés). */
export interface SchoolProfile extends SchoolProfileInput {
  display_name: string;
  is_configured: boolean;
  has_logo: boolean;
  has_stamp: boolean;
  updated_at: string | null;
}
