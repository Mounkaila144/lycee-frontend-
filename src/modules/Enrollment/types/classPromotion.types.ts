/**
 * Passages de classe de fin d'année (lycée) — contrat de
 * GET  /admin/enrollment/class-promotions/classes/{classeId}/prepare
 * POST /admin/enrollment/class-promotions/validate
 */

export type PromotionDecision = 'passage' | 'redoublement' | 'depart';

export type DepartReason = 'Abandon' | 'Transfert' | 'Exclusion' | 'Diplôme';

export interface PromotionTargetClasse {
  id: number;
  name: string;
  level_id: number | null;
  series_id: number | null;
  max_capacity: number | null;
  enrolled_count: number;
}

export interface PromotionStudentRow {
  student: { id: number; matricule: string | null; full_name: string };
  class_enrollment_id: number;
  enrollment_status: string;
  final_decision: string | null;
  annual_average: number | null;
  annual_rank: number | null;
  intention: boolean | null;
  proposed_decision: PromotionDecision | null;
  proposed_target_classe_id: number | null;
  target_enrollment: {
    id: number;
    classe_id: number;
    classe_name: string | null;
    assignment_type: string;
  } | null;
}

export interface ClassPromotionPreparation {
  classe: {
    id: number;
    name: string;
    level: { id: number; code: string; name: string } | null;
    academic_year: { id: number; name: string } | null;
  };
  target_academic_year: { id: number; name: string } | null;
  next_level: { id: number; code: string; name: string } | null;
  grades_available: boolean;
  target_classes: Record<'passage' | 'redoublement', PromotionTargetClasse[]>;
  students: PromotionStudentRow[];
}

export interface PromotionDecisionItem {
  student_id: number;
  decision: PromotionDecision;
  target_classe_id?: number | null;
  depart_reason?: DepartReason | null;
}

export interface ValidatePromotionsPayload {
  source_classe_id: number;
  target_academic_year_id: number;
  items: PromotionDecisionItem[];
}

export interface ValidatePromotionsResult {
  message: string;
  data: {
    processed: Array<{
      student_id: number;
      decision: PromotionDecision;
      class_enrollment_id: number | null;
      target_classe_id: number | null;
    }>;
    errors: Array<{ student_id: number; message: string }>;
  };
}
