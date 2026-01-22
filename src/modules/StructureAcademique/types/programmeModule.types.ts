/**
 * Types pour l'association Programme ↔ Module
 */

import type { Module, ModuleLevel } from './module.types';

/**
 * Association Programme-Module dans la table pivot
 */
export interface ProgrammeModule {
  id: number;
  programme_id: number;
  module_id: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  module?: Module;
}

/**
 * Données pour associer des modules à un programme
 */
export interface AssociateModulesData {
  module_ids: number[];
}

/**
 * Réponse API pour les modules d'un programme
 */
export interface ProgrammeModulesResponse {
  data: Module[];
  message?: string;
}

/**
 * Modules groupés par niveau pour affichage
 */
export interface ModulesByLevel {
  level: ModuleLevel;
  modules: Module[];
}

/**
 * Statistiques des modules d'un programme
 */
export interface ProgrammeModuleStats {
  total: number;
  by_level: Record<ModuleLevel, number>;
  by_type: {
    Obligatoire: number;
    Optionnel: number;
  };
  eliminatory_count: number;
  total_credits: number;
}

/**
 * Helper pour grouper les modules par niveau
 */
export const groupModulesByLevel = (modules: Module[]): ModulesByLevel[] => {
  const levels: ModuleLevel[] = ['L1', 'L2', 'L3', 'M1', 'M2'];
  
  return levels
    .map(level => ({
      level,
      modules: modules.filter(m => m.level === level),
    }))
    .filter(group => group.modules.length > 0);
};

/**
 * Helper pour calculer les statistiques
 */
export const calculateModuleStats = (modules: Module[]): ProgrammeModuleStats => {
  const stats: ProgrammeModuleStats = {
    total: modules.length,
    by_level: {
      L1: 0,
      L2: 0,
      L3: 0,
      M1: 0,
      M2: 0,
    },
    by_type: {
      Obligatoire: 0,
      Optionnel: 0,
    },
    eliminatory_count: 0,
    total_credits: 0,
  };

  modules.forEach(module => {
    stats.by_level[module.level]++;
    stats.by_type[module.type]++;
    if (module.is_eliminatory) {
      stats.eliminatory_count++;
    }
    stats.total_credits += module.credits_ects;
  });

  return stats;
};
