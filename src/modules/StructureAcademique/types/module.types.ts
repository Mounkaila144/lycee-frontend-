/**
 * Types pour le module Structure Académique - Modules/UE
 */

export type ModuleType = 'Obligatoire' | 'Optionnel';
export type ModuleSemester = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10';
export type ModuleLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';

export interface Module {
  id: number;
  code: string;
  name: string;
  credits_ects: number;
  coefficient: number;
  type: ModuleType;
  semester: ModuleSemester;
  level: ModuleLevel;
  description?: string;
  hours_cm?: number;
  hours_td?: number;
  hours_tp?: number;
  total_hours: number;
  is_eliminatory: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Relations
  programs?: Array<{
    id: number;
    code: string;
    libelle: string;
  }>;
  programmes?: Array<{
    id: number;
    code: string;
    libelle: string;
  }>;
  
  // Metadata
  can_be_modified?: boolean;
  can_be_deleted?: boolean;
  programs_count?: number;
  enrollments_count?: number;
}

export interface ModuleFormData {
  code: string;
  name: string;
  credits_ects: number;
  coefficient: number;
  type: ModuleType;
  semester: ModuleSemester;
  level: ModuleLevel;
  description?: string | null;
  hours_cm?: number | null;
  hours_td?: number | null;
  hours_tp?: number | null;
  is_eliminatory: boolean;
}

/**
 * Query parameters for module list
 */
export interface ModuleQueryParams {
  page?: number;
  per_page?: number;
  search?: string; // Global search across code, name
  level?: ModuleLevel; // Filter by level
  semester?: ModuleSemester; // Filter by semester
  type?: ModuleType; // Filter by type
  is_eliminatory?: boolean; // Filter by eliminatory status
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
 * Paginated response from API
 */
export interface PaginatedModulesResponse {
  data: Module[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ModuleResponse {
  data: Module;
  message?: string;
}

export interface ModuleStatistics {
  total: number;
  by_level: {
    L1: number;
    L2: number;
    L3: number;
    M1: number;
    M2: number;
  };
  by_type: {
    Obligatoire: number;
    Optionnel: number;
  };
  by_semester: {
    S1: number;
    S2: number;
    S3: number;
    S4: number;
    S5: number;
    S6: number;
    S7: number;
    S8: number;
    S9: number;
    S10: number;
  };
  eliminatory_count: number;
}

/**
 * Helper pour obtenir le label du type
 */
export const getModuleTypeLabel = (type: ModuleType): string => {
  const labels: Record<ModuleType, string> = {
    Obligatoire: 'Obligatoire',
    Optionnel: 'Optionnel',
  };
  return labels[type];
};

/**
 * Helper pour obtenir la couleur du badge selon le type
 */
export const getModuleTypeBadgeColor = (type: ModuleType): 'primary' | 'warning' => {
  return type === 'Obligatoire' ? 'primary' : 'warning';
};

/**
 * Helper pour obtenir le label du niveau
 */
export const getModuleLevelLabel = (level: ModuleLevel): string => {
  const labels: Record<ModuleLevel, string> = {
    L1: 'Licence 1',
    L2: 'Licence 2',
    L3: 'Licence 3',
    M1: 'Master 1',
    M2: 'Master 2',
  };
  return labels[level];
};

/**
 * Helper pour obtenir le label du semestre
 */
export const getModuleSemesterLabel = (semester: ModuleSemester): string => {
  return `Semestre ${semester.substring(1)}`;
};

/**
 * Helper pour valider la cohérence semestre/niveau
 */
export const isSemesterLevelConsistent = (semester: ModuleSemester, level: ModuleLevel): boolean => {
  const semesterNum = parseInt(semester.substring(1));
  
  switch (level) {
    case 'L1':
      return semesterNum >= 1 && semesterNum <= 2;
    case 'L2':
      return semesterNum >= 3 && semesterNum <= 4;
    case 'L3':
      return semesterNum >= 5 && semesterNum <= 6;
    case 'M1':
      return semesterNum >= 7 && semesterNum <= 8;
    case 'M2':
      return semesterNum >= 9 && semesterNum <= 10;
    default:
      return false;
  }
};

/**
 * Helper pour obtenir les semestres disponibles selon le niveau
 */
export const getSemestersForLevel = (level: ModuleLevel): ModuleSemester[] => {
  switch (level) {
    case 'L1':
      return ['S1', 'S2'];
    case 'L2':
      return ['S3', 'S4'];
    case 'L3':
      return ['S5', 'S6'];
    case 'M1':
      return ['S7', 'S8'];
    case 'M2':
      return ['S9', 'S10'];
    default:
      return [];
  }
};
