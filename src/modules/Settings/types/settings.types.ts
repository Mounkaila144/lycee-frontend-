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
