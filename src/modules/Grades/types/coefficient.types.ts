/**
 * Grades Module - Coefficient Types
 * Types for coefficient and ECTS credits management
 */

import type { Evaluation, EvaluationType } from './grade.types';

/**
 * Module with coefficient information
 */
export interface ModuleCoefficients {
  id: number;
  code: string;
  name: string;
  credits_ects: number;
  credits_locked: boolean;
  total_coefficients: number;
  evaluations: EvaluationCoefficient[];
  has_published_grades: boolean;
  can_modify: boolean;
}

/**
 * Evaluation with coefficient details
 */
export interface EvaluationCoefficient {
  id: number;
  type: EvaluationType;
  name: string;
  coefficient: number;
  max_score: number;
  is_locked: boolean;
  has_grades: boolean;
  has_published_grades: boolean;
  can_modify_coefficient: boolean;
  grades_count: number;
}

/**
 * Update coefficient request
 */
export interface UpdateCoefficientRequest {
  coefficient: number;
  reason?: string;
}

/**
 * Update coefficient response
 */
export interface UpdateCoefficientResponse {
  success: boolean;
  message: string;
  evaluation: EvaluationCoefficient;
  recalculated_count: number;
}

/**
 * Update credits ECTS request
 */
export interface UpdateCreditsRequest {
  credits_ects: number;
  reason?: string;
}

/**
 * Update credits response
 * Matches backend: { id, credits_ects }
 */
export interface UpdateCreditsResponse {
  id: number;
  credits_ects: number;
}

/**
 * Coefficient impact simulation result
 */
export interface CoefficientImpactSimulation {
  affected_students: number;
  samples: CoefficientImpactSample[];
  average_change: number;
}

/**
 * Single student impact sample
 */
export interface CoefficientImpactSample {
  student_name: string;
  old_average: number;
  new_average: number;
  diff: number;
}

/**
 * Simulate impact request
 */
export interface SimulateImpactRequest {
  new_coefficient: number;
}

/**
 * Coefficient history entry
 */
export interface CoefficientHistoryEntry {
  id: number;
  evaluation_id?: number;
  old_coefficient: number;
  new_coefficient: number;
  difference?: number;
  changed_by: string;
  reason: string | null;
  changed_at: string;
}

/**
 * Credits history entry
 */
export interface CreditsHistoryEntry {
  id: number;
  module_id?: number;
  old_credits: number;
  new_credits: number;
  difference?: number;
  changed_by: string;
  reason: string | null;
  changed_at: string;
}

/**
 * Coefficient template
 */
export interface CoefficientTemplate {
  id: number;
  name: string;
  description: string | null;
  evaluations: CoefficientTemplateEvaluation[];
  is_system: boolean;
  tenant_id: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Evaluation definition in template
 */
export interface CoefficientTemplateEvaluation {
  type: EvaluationType;
  coefficient: number;
}

/**
 * Create template request
 */
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  evaluations: CoefficientTemplateEvaluation[];
}

/**
 * Apply template request
 */
export interface ApplyTemplateRequest {
  template_id: number;
}

/**
 * Apply template response
 */
export interface ApplyTemplateResponse {
  success: boolean;
  message: string;
  created_evaluations: number;
}

/**
 * Coefficient validation constraints
 */
export const COEFFICIENT_CONSTRAINTS = {
  MIN: 0.25,
  MAX: 10,
  STEP: 0.25,
} as const;

/**
 * ECTS credits validation constraints
 */
export const CREDITS_CONSTRAINTS = {
  MIN: 1,
  MAX: 30,
  SEMESTER_RECOMMENDED: 30,
} as const;

/**
 * Predefined coefficient templates (system defaults)
 */
export const SYSTEM_TEMPLATES: Omit<CoefficientTemplate, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>[] = [
  {
    name: 'Standard LMD',
    description: 'Configuration standard pour le système LMD',
    evaluations: [
      { type: 'CC', coefficient: 1 },
      { type: 'TP', coefficient: 1 },
      { type: 'Examen', coefficient: 2 },
    ],
    is_system: true,
  },
  {
    name: 'Sciences expérimentales',
    description: 'Pour les modules avec travaux pratiques importants',
    evaluations: [
      { type: 'CC', coefficient: 1 },
      { type: 'TP', coefficient: 2 },
      { type: 'Examen', coefficient: 2 },
    ],
    is_system: true,
  },
  {
    name: 'Sciences humaines',
    description: 'Pour les modules avec exposés et dissertations',
    evaluations: [
      { type: 'CC', coefficient: 2 },
      { type: 'Oral', coefficient: 1 },
      { type: 'Examen', coefficient: 2 },
    ],
    is_system: true,
  },
  {
    name: 'Informatique',
    description: 'Pour les modules avec projets pratiques',
    evaluations: [
      { type: 'CC', coefficient: 1 },
      { type: 'Projet', coefficient: 2 },
      { type: 'Examen', coefficient: 2 },
    ],
    is_system: true,
  },
];
