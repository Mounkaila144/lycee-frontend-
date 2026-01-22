/**
 * Types pour l'historique des modifications de programmes
 */

export type HistoryAction = 'created' | 'updated' | 'deleted' | 'restored' | 'activated' | 'deactivated';

export interface ProgrammeHistory {
  id: number;
  programme_id: number;
  user_id: number;
  action: HistoryAction;
  field_changed?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: string;
  
  // Relations
  user?: {
    id: number;
    name: string;
    email: string;
  };
  programme?: {
    id: number;
    code: string;
    libelle: string;
  };
}

export interface ProgrammeHistoryQueryParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  action?: HistoryAction;
  field_changed?: string;
}

export interface PaginatedHistoryResponse {
  data: ProgrammeHistory[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface HistoryComparisonParams {
  version1_id: number;
  version2_id: number;
}

export interface HistoryComparison {
  version1: ProgrammeHistory;
  version2: ProgrammeHistory;
  differences: Array<{
    field: string;
    old_value: any;
    new_value: any;
    changed: boolean;
  }>;
}

export interface RestoreVersionData {
  history_id: number;
  reason?: string;
}
