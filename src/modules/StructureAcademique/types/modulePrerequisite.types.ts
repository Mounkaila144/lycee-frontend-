/**
 * Types pour les prérequis entre modules
 */

export type PrerequisiteType = 'Strict' | 'Recommandé';

export interface ModulePrerequisite {
  id: number;
  module_id: number;
  prerequisite_module_id: number;
  type: PrerequisiteType;
  created_at: string;
  updated_at: string;
  
  // Relations
  prerequisite_module?: {
    id: number;
    code: string;
    name: string;
    level: string;
    semester: string;
    credits_ects: number;
  };
}

export interface AddPrerequisiteRequest {
  prerequisite_module_id: number;
  type: PrerequisiteType;
}

export interface PrerequisiteResponse {
  data: ModulePrerequisite[];
  message?: string;
}

export interface DependencyNode {
  id: number;
  code: string;
  name: string;
  level: string;
  semester: string;
  credits_ects: number;
  prerequisites: DependencyNode[];
}

export interface DependencyGraph {
  module: {
    id: number;
    code: string;
    name: string;
    level: string;
    semester: string;
  };
  critical_path: Array<{
    id: number;
    code: string;
    name: string;
    level: string;
    semester: string;
  }>;
  dependent_modules: Array<{
    id: number;
    code: string;
    name: string;
    level: string;
    semester: string;
  }>;
}

export interface DependencyGraphResponse {
  data: DependencyGraph;
  message?: string;
}

export interface EnrollmentEligibility {
  allowed: boolean;
  missing_prerequisites: string[];
  message: string;
}

export interface EnrollmentEligibilityResponse {
  data: EnrollmentEligibility;
  message?: string;
}

/**
 * Helper pour obtenir le label du type de prérequis
 */
export const getPrerequisiteTypeLabel = (type: PrerequisiteType): string => {
  const labels: Record<PrerequisiteType, string> = {
    Strict: 'Strict',
    Recommandé: 'Recommandé',
  };
  return labels[type];
};

/**
 * Helper pour obtenir la couleur du badge selon le type
 */
export const getPrerequisiteTypeBadgeColor = (type: PrerequisiteType): 'error' | 'warning' => {
  return type === 'Strict' ? 'error' : 'warning';
};
