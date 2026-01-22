/**
 * Types pour le module Structure Académique - Programmes
 */

export type ProgrammeType = 'Licence' | 'Master' | 'Doctorat';
export type ProgrammeStatus = 'Brouillon' | 'Actif' | 'Inactif' | 'Archivé';

export interface Programme {
  id: number;
  code: string;
  libelle: string;
  type: ProgrammeType;
  duree_annees: number;
  description?: string;
  responsable_id?: number;
  statut: ProgrammeStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relations
  responsable?: {
    id: number;
    name: string;
    email: string;
  };
  // Levels can be returned as array of strings ["L1","L2"] or array of objects [{id, level}]
  levels?: Array<{
    id: number;
    level: string;
  }> | string[];  
  // Metadata
  can_be_modified?: boolean;
  can_be_deleted?: boolean;
  can_be_activated?: boolean;
  levels_count?: number;
  students_count?: number;
}

export interface ProgrammeFormData {
  code: string;
  libelle: string;
  type: ProgrammeType;
  duree_annees: number;
  description?: string | null;
  responsable_id: number | null;  // Requis par le backend mais peut être null temporairement dans le form
}

/**
 * Query parameters for programme list (matching API documentation)
 */
export interface ProgrammeQueryParams {
  page?: number;
  per_page?: number;
  search?: string; // Global search across code, libelle
  type?: ProgrammeType; // Filter by programme type
  statut?: ProgrammeStatus; // Filter by status
}

/**
 * Pagination links from Laravel API
 */
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/**
 * Pagination meta information from Laravel API
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

/**
 * Paginated response from API (Laravel structure)
 */
export interface PaginatedProgrammesResponse {
  data: Programme[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ProgrammeResponse {
  data: Programme;
  message?: string;
}

export interface ProgrammeStatistics {
  total: number;
  by_type: {
    Licence: number;
    Master: number;
    Doctorat: number;
  };
  by_status: {
    Brouillon: number;
    Actif: number;
    Inactif: number;
    Archivé: number;
  };
}

export interface ChangeStatusData {
  statut: ProgrammeStatus;
}

/**
 * Import/Export Types
 */
export interface ImportPreviewRow {
  row_number: number;
  data: {
    code: string;
    libelle: string;
    type: ProgrammeType;
    duree_annees: number;
    responsable_email?: string;
    description?: string;
  };
  errors: string[];
  warnings: string[];
  is_valid: boolean;
}

export interface ImportPreviewResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  rows: ImportPreviewRow[];
  can_import: boolean;
  preview_key?: string; // Added for backend correlation
}

export interface ImportConfirmResponse {
  success: boolean;
  created_count: number;
  failed_count: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  message: string;
}

export interface ExportParams {
  format: 'excel' | 'csv';
  statut?: ProgrammeStatus;
  type?: ProgrammeType;
}
