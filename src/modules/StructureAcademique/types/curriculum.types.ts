/**
 * Curriculum Types - Tronc Commun et Options
 */

import type { Module } from './module.types';
import type { Specialization } from './specialization.types';

/**
 * Module Type for Specialization
 */
export type SpecializationModuleType = 'Obligatoire' | 'Optionnel';

/**
 * Student Module Choice Status
 */
export type ModuleChoiceStatus = 'Pending' | 'Confirmed' | 'Cancelled';

/**
 * Core Curriculum Module (Tronc Commun)
 */
export interface CoreCurriculumModule {
  id: number;
  programme_id: number;
  level: string;
  module_id: number;
  module?: Module;
  created_at: string;
  updated_at: string;
}

/**
 * Specialization Module
 */
export interface SpecializationModule {
  id: number;
  specialization_id: number;
  module_id: number;
  type: SpecializationModuleType;
  capacity: number | null;
  current_enrollment?: number;
  module?: Module;
  specialization?: Specialization;
  created_at: string;
  updated_at: string;
}

/**
 * Student Module Choice
 */
export interface StudentModuleChoice {
  id: number;
  student_id: number;
  module_id: number;
  specialization_id: number;
  choice_date: string;
  status: ModuleChoiceStatus;
  module?: Module;
  created_at: string;
  updated_at: string;
}

/**
 * Form Data for Core Curriculum Module
 */
export interface CoreCurriculumModuleFormData {
  programme_id: number;
  level: string;
  module_id: number;
}

/**
 * Form Data for Specialization Module
 */
export interface SpecializationModuleFormData {
  specialization_id: number;
  module_id: number;
  type: SpecializationModuleType;
  capacity?: number | null;
}

/**
 * Form Data for Student Elective Choices
 */
export interface ElectiveChoiceFormData {
  student_id: number;
  specialization_id: number;
  module_ids: number[];
}

/**
 * Available Elective Module
 */
export interface AvailableElective {
  module: Module;
  capacity: number | null;
  current_enrollment: number;
  is_full: boolean;
  can_enroll: boolean;
}

/**
 * Student Curriculum (Complete)
 */
export interface StudentCurriculum {
  student_id: number;
  programme_id: number;
  level: string;
  specialization_id: number | null;
  core_modules: Module[];
  specialization_modules: {
    obligatory: Module[];
    electives: Module[];
  };
  selected_electives: StudentModuleChoice[];
  constraints: {
    min_electives: number;
    max_electives: number;
    selected_count: number;
    is_valid: boolean;
  };
}

/**
 * Curriculum Result (Service Response)
 */
export interface CurriculumResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

/**
 * API Response Types
 */
export interface CoreCurriculumResponse {
  data: CoreCurriculumModule[];
}

export interface SpecializationModulesResponse {
  data: SpecializationModule[];
}

export interface AvailableElectivesResponse {
  data: AvailableElective[];
  constraints: {
    min_electives: number;
    max_electives: number;
  };
}

export interface StudentCurriculumResponse {
  data: StudentCurriculum;
}

/**
 * Curriculum Tree Node (for visualization)
 */
export interface CurriculumTreeNode {
  id: string;
  label: string;
  type: 'programme' | 'level' | 'core' | 'specialization' | 'module';
  children?: CurriculumTreeNode[];
  data?: any;
}

/**
 * Helper Functions
 */
export const getSpecializationModuleTypeLabel = (type: SpecializationModuleType): string => {
  const labels: Record<SpecializationModuleType, string> = {
    Obligatoire: 'Obligatoire',
    Optionnel: 'Optionnel',
  };
  return labels[type];
};

export const getSpecializationModuleTypeBadgeColor = (
  type: SpecializationModuleType
): 'success' | 'info' => {
  const colors: Record<SpecializationModuleType, 'success' | 'info'> = {
    Obligatoire: 'success',
    Optionnel: 'info',
  };
  return colors[type];
};

export const getChoiceStatusLabel = (status: ModuleChoiceStatus): string => {
  const labels: Record<ModuleChoiceStatus, string> = {
    Pending: 'En attente',
    Confirmed: 'Confirmé',
    Cancelled: 'Annulé',
  };
  return labels[status];
};

export const getChoiceStatusColor = (
  status: ModuleChoiceStatus
): 'warning' | 'success' | 'error' => {
  const colors: Record<ModuleChoiceStatus, 'warning' | 'success' | 'error'> = {
    Pending: 'warning',
    Confirmed: 'success',
    Cancelled: 'error',
  };
  return colors[status];
};
