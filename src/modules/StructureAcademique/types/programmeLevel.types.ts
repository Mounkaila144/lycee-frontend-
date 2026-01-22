/**
 * Types pour les niveaux de programmes (L1-L3, M1-M2)
 */

export type ProgrammeLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';

export interface ProgrammeLevelData {
  id: number;
  program_id: number;
  level: ProgrammeLevel;
  created_at: string;
  updated_at: string;
}

export interface AssociateLevelsRequest {
  levels: ProgrammeLevel[];
}

export interface ProgrammeLevelResponse {
  data: ProgrammeLevelData[];
  message?: string;
}

/**
 * Helper pour obtenir les niveaux disponibles selon le type de programme
 */
export const getLevelsForProgramType = (type: 'Licence' | 'Master' | 'Doctorat'): ProgrammeLevel[] => {
  switch (type) {
    case 'Licence':
      return ['L1', 'L2', 'L3'];
    case 'Master':
      return ['M1', 'M2'];
    case 'Doctorat':
      return []; // Pas de niveaux prédéfinis pour Doctorat
    default:
      return [];
  }
};

/**
 * Helper pour obtenir la couleur du badge selon le niveau
 */
export const getLevelBadgeColor = (level: ProgrammeLevel): 'primary' | 'secondary' => {
  if (level.startsWith('L')) return 'primary'; // Bleu pour Licence
  if (level.startsWith('M')) return 'secondary'; // Violet pour Master
  return 'primary';
};

/**
 * Helper pour obtenir le label complet du niveau
 */
export const getLevelLabel = (level: ProgrammeLevel): string => {
  const labels: Record<ProgrammeLevel, string> = {
    L1: 'Licence 1',
    L2: 'Licence 2',
    L3: 'Licence 3',
    M1: 'Master 1',
    M2: 'Master 2',
  };
  return labels[level];
};
