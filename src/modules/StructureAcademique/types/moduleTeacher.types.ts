/**
 * Types pour l'affectation des enseignants aux modules
 */

export type TeachingType = 'CM' | 'TD' | 'TP';

export interface ModuleTeacher {
  id: number;
  module_id: number;
  teacher_id: number;
  teaching_type: TeachingType;
  hours_assigned: number;
  academic_year: string;
  created_at: string;
  updated_at: string;

  // Relations
  teacher?: {
    id: number;
    name: string;
    email: string;
    department?: string;
  };
  module?: {
    id: number;
    code: string;
    name: string;
    level: string;
    semester: string;
  };
}

export interface AssignTeacherRequest {
  teacher_id: number;
  module_id: number;
  programme_id: number;
  level: string;
  semester_id: number;
  type: TeachingType;
  hours_allocated: number;
  group_id: null | number;
}

export interface TeacherWorkload {
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  total_hours: number;
  cm_hours: number;
  td_hours: number;
  tp_hours: number;
  modules_count: number;
  assignments: Array<{
    module_code: string;
    module_name: string;
    teaching_type: TeachingType;
    hours: number;
  }>;
}

export interface ModuleTeachersResponse {
  data: ModuleTeacher[];
  message?: string;
}

export interface ModuleTeacherResponse {
  data: ModuleTeacher;
  message?: string;
}

export interface TeacherWorkloadResponse {
  data: TeacherWorkload;
  message?: string;
}

/**
 * Helper pour obtenir le label du type d'enseignement
 */
export const getTeachingTypeLabel = (type: TeachingType): string => {
  const labels: Record<TeachingType, string> = {
    CM: 'Cours Magistral',
    TD: 'Travaux Dirigés',
    TP: 'Travaux Pratiques',
  };
  return labels[type];
};

/**
 * Helper pour obtenir la couleur du badge selon le type
 */
export const getTeachingTypeBadgeColor = (type: TeachingType): 'primary' | 'secondary' | 'success' => {
  const colors: Record<TeachingType, 'primary' | 'secondary' | 'success'> = {
    CM: 'primary',
    TD: 'secondary',
    TP: 'success',
  };
  return colors[type];
};

/**
 * Helper pour obtenir l'année académique actuelle
 */
export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-11 -> 1-12
  
  // Si on est entre septembre et décembre, l'année académique commence cette année
  // Sinon, elle a commencé l'année précédente
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

/**
 * Helper pour générer les années académiques (5 dernières + 2 prochaines)
 */
export const getAcademicYears = (): string[] => {
  const current = getCurrentAcademicYear();
  const [startYear] = current.split('-').map(Number);
  
  const years: string[] = [];
  for (let i = -5; i <= 2; i++) {
    const year = startYear + i;
    years.push(`${year}-${year + 1}`);
  }
  
  return years;
};
