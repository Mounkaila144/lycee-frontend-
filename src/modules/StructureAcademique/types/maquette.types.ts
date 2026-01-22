/**
 * Types pour la génération de maquettes pédagogiques PDF
 */

export type MaquetteScope = 'programme' | 'level' | 'semester';
export type MaquetteFormat = 'pdf';

export interface MaquetteGenerationOptions {
  // Scope filters
  scope?: MaquetteScope;
  level?: string; // L1, L2, L3, M1, M2
  semester?: string; // S1, S2

  // Display options
  show_teachers?: boolean;
  show_hours_detail?: boolean;
  include_optional_modules?: boolean;
  include_specializations?: boolean;

  // Language (future)
  language?: 'fr' | 'en' | 'ar';
}

export interface MaquetteGenerationRequest {
  programme_id: number;
  options?: MaquetteGenerationOptions;
}

export interface MaquetteGenerationResponse {
  success: boolean;
  message: string;
  file_path?: string;
  file_url?: string;
  filename?: string;
  generated_at?: string;
}

export interface MaquettePreviewData {
  programme: {
    code: string;
    libelle: string;
    type: string;
    duree_annees: number;
    responsable?: {
      name: string;
    };
  };
  modules_count: number;
  levels: string[];
  total_credits: number;
  estimated_pages: number;
}

export interface MaquetteDownloadParams {
  programme_id: number;
  filename: string;
}
