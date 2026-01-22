/**
 * Types pour la validation de progression pédagogique
 */

export type ProgressionLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';
export type ProgressionStatus = 'automatic_pass' | 'conditional_pass' | 'must_repeat' | 'blocked_eliminatory';

export interface ProgressionRule {
  id: number;
  programme_id: number | null;
  from_level: ProgressionLevel;
  to_level: ProgressionLevel;
  min_credits_required: number;
  max_debt_allowed: number;
  allow_conditional_pass: boolean;
  max_repeats_before_exclusion: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  programme?: {
    id: number;
    code: string;
    libelle: string;
  };
}

export interface ProgressionRuleFormData {
  programme_id: number | null;
  from_level: ProgressionLevel;
  to_level: ProgressionLevel;
  min_credits_required: number;
  max_debt_allowed: number;
  allow_conditional_pass: boolean;
  max_repeats_before_exclusion: number;
}

export interface EliminatoryModule {
  id: number;
  programme_id: number;
  module_id: number;
  level: ProgressionLevel;
  created_at: string;
  updated_at: string;
  
  // Relations
  module?: {
    id: number;
    code: string;
    name: string;
    credits_ects: number;
    semester: string;
  };
  programme?: {
    id: number;
    code: string;
    libelle: string;
  };
}

export interface AddEliminatoryModuleRequest {
  programme_id: number;
  module_id: number;
  level: ProgressionLevel;
}

export interface ProgressionResult {
  allowed: boolean;
  status: ProgressionStatus;
  credits?: number;
  debt?: number;
  message?: string;
  missing_eliminatory_modules?: string[];
}

export interface ProgressionRulesResponse {
  data: ProgressionRule[];
  message?: string;
}

export interface ProgressionRuleResponse {
  data: ProgressionRule;
  message?: string;
}

export interface EliminatoryModulesResponse {
  data: EliminatoryModule[];
  message?: string;
}

export interface ProgressionResultResponse {
  data: ProgressionResult;
  message?: string;
}

/**
 * Helper pour obtenir le label du statut de progression
 */
export const getProgressionStatusLabel = (status: ProgressionStatus): string => {
  const labels: Record<ProgressionStatus, string> = {
    automatic_pass: 'Passage Automatique',
    conditional_pass: 'Passage Conditionnel',
    must_repeat: 'Redoublement',
    blocked_eliminatory: 'Bloqué (Module Éliminatoire)',
  };
  return labels[status];
};

/**
 * Helper pour obtenir la couleur du badge selon le statut
 */
export const getProgressionStatusColor = (status: ProgressionStatus): 'success' | 'warning' | 'error' | 'default' => {
  const colors: Record<ProgressionStatus, 'success' | 'warning' | 'error' | 'default'> = {
    automatic_pass: 'success',
    conditional_pass: 'warning',
    must_repeat: 'error',
    blocked_eliminatory: 'error',
  };
  return colors[status];
};

/**
 * Helper pour obtenir les niveaux cibles possibles selon le niveau source
 */
export const getTargetLevels = (fromLevel: ProgressionLevel): ProgressionLevel[] => {
  const transitions: Record<ProgressionLevel, ProgressionLevel[]> = {
    L1: ['L2'],
    L2: ['L3'],
    L3: ['M1'],
    M1: ['M2'],
    M2: [],
  };
  return transitions[fromLevel] || [];
};

/**
 * Helper pour obtenir le label de la transition
 */
export const getTransitionLabel = (fromLevel: ProgressionLevel, toLevel: ProgressionLevel): string => {
  return `${fromLevel} → ${toLevel}`;
};
