/**
 * Types du modèle de notes « lycée » (contrat API /api/admin/lycee-grades).
 *
 * Note : les colonnes décimales Laravel peuvent être sérialisées en chaîne
 * ("12.50"). Utiliser `toScore()` (voir ../utils) avant tout calcul/affichage.
 */

export type Decimal = number | string;

export type ClassEvaluationType = 'devoir' | 'interrogation' | 'composition';

export type ClassEvaluationStatus = 'draft' | 'submitted' | 'published';

export interface RefItem {
  id: number;
  name: string;
}

export interface TeacherRef {
  id: number;
  full_name: string;
}

export interface SubjectRef {
  id: number;
  name: string;
  code?: string | null;
  short_name?: string | null;
}

export interface SemesterRef {
  id: number;
  name: string;
  is_active?: boolean;
  closed_at?: string | null;
  academic_year_id?: number;
}

export interface StudentRef {
  id: number;
  matricule?: string | null;
  full_name: string;
}

/* ------------------------------------------------------------------ */
/* Affectations                                                        */
/* ------------------------------------------------------------------ */

export interface TeacherAssignment {
  id: number;
  teacher: TeacherRef | null;
  classe: RefItem;
  subject: SubjectRef;
  academic_year_id: number;
  /** Présents sur /assignments/mine */
  students_count?: number;
  coefficient?: Decimal | null;
  /** Présent si le backend l'expose (/assignments/mine) */
  is_head_teacher?: boolean;
}

export interface AssignmentFilters {
  academic_year_id?: number;
  classe_id?: number;
  teacher_id?: number;
}

export interface AssignmentPayload {
  teacher_id: number;
  classe_id: number;
  subject_id: number;
}

export interface BulkAssignmentItem {
  subject_id: number;
  teacher_id: number | null;
}

export interface BulkAssignmentPayload {
  classe_id: number;
  items: BulkAssignmentItem[];
}

/** GET /classes/{classe}/subjects */
export interface ClassSubject {
  id: number;
  name: string;
  code?: string | null;
  short_name?: string | null;
  coefficient: Decimal | null;
  hours_per_week?: Decimal | null;
  teacher: TeacherRef | null;
  assignment_id?: number | null;
}

/* ------------------------------------------------------------------ */
/* Évaluations                                                         */
/* ------------------------------------------------------------------ */

export interface ClassEvaluation {
  id: number;
  title: string;
  type: ClassEvaluationType;
  evaluation_date: string;
  max_score: Decimal;
  weight: Decimal;
  status: ClassEvaluationStatus;
  classe: RefItem;
  subject: SubjectRef;
  semester: SemesterRef;
  teacher: TeacherRef | null;
  grades_count: number;
  students_count: number;
  average: Decimal | null;
  submitted_at?: string | null;
  published_at?: string | null;
}

export interface ClassEvaluationGradeRow {
  student: StudentRef;
  score: Decimal | null;
  is_absent: boolean;
  comment: string | null;
}

export interface ClassEvaluationDetail extends ClassEvaluation {
  grades: ClassEvaluationGradeRow[];
}

export interface EvaluationFilters {
  classe_id?: number;
  subject_id?: number;
  semester_id?: number;
  status?: ClassEvaluationStatus;
  teacher_id?: number;
}

export interface EvaluationPayload {
  classe_id: number;
  subject_id: number;
  semester_id: number;
  title: string;
  type: ClassEvaluationType;
  evaluation_date: string;
  max_score?: number;
  weight?: number;
}

export interface GradeEntryPayload {
  student_id: number;
  score: number | null;
  is_absent: boolean;
  comment?: string | null;
}

export interface PublishBulkPayload {
  semester_id: number;
  classe_id?: number;
  evaluation_ids?: number[];
}

/* ------------------------------------------------------------------ */
/* Résultats de classe                                                 */
/* ------------------------------------------------------------------ */

export interface ResultSubject {
  id: number;
  name: string;
  code?: string | null;
  coefficient: Decimal | null;
  teacher: TeacherRef | null;
}

export interface SubjectAverageCell {
  average: Decimal | null;
  rank: number | null;
}

export interface ClassResultStudentRow {
  student: StudentRef;
  subjects: Record<string, SubjectAverageCell>;
  general_average: Decimal | null;
  rank: number | null;
  mention: string | null;
  distinction: string | null;
  general_appreciation?: string | null;
}

export interface SubjectStats {
  class_average: Decimal | null;
  highest: Decimal | null;
  lowest: Decimal | null;
  pass_rate?: Decimal | null;
}

export interface ClassResultsStats {
  class_average: Decimal | null;
  highest: Decimal | null;
  lowest: Decimal | null;
  /** Pourcentage (0-100) d'élèves ayant une moyenne ≥ 10 */
  pass_rate: Decimal | null;
  passed_count?: number;
  graded_count?: number;
  class_size?: number;
  by_subject: Record<string, SubjectStats>;
}

/** Résumé de classe renvoyé par les endpoints de résultats */
export interface ClasseSummary extends RefItem {
  academic_year_id?: number | null;
  head_teacher?: TeacherRef | null;
}

export interface ClassResults {
  classe: ClasseSummary;
  semester: SemesterRef;
  subjects: ResultSubject[];
  students: ClassResultStudentRow[];
  stats: ClassResultsStats;
}

/* ------------------------------------------------------------------ */
/* Résultats élève (admin, élève, parent)                              */
/* ------------------------------------------------------------------ */

export interface StudentResultEvaluation {
  id: number;
  title: string;
  type: ClassEvaluationType;
  date: string;
  score: Decimal | null;
  max_score: Decimal;
  is_absent: boolean;
  weight: Decimal;
  comment?: string | null;
  status?: ClassEvaluationStatus;
}

export interface StudentResultSubject {
  subject: SubjectRef;
  coefficient: Decimal | null;
  teacher: TeacherRef | null;
  evaluations: StudentResultEvaluation[];
  average: Decimal | null;
  weighted_average?: Decimal | null;
  class_average: Decimal | null;
  highest?: Decimal | null;
  lowest?: Decimal | null;
  rank: number | null;
  appreciation: string | null;
}

export interface StudentAnnualResult {
  average: Decimal | null;
  rank: number | null;
}

export interface StudentResults {
  student: StudentRef;
  classe: ClasseSummary | null;
  semester: SemesterRef | null;
  subjects: StudentResultSubject[];
  totals?: { coefficients: Decimal; weighted_points: Decimal };
  class_stats?: { class_average: Decimal | null; highest: Decimal | null; lowest: Decimal | null };
  general_average: Decimal | null;
  rank: number | null;
  class_size: number | null;
  mention: string | null;
  distinction: string | null;
  general_appreciation: string | null;
  annual: StudentAnnualResult | null;
}

/** meta renvoyé par /frontend/student/my-grades et le portail parent */
export interface StudentResultsMeta {
  semesters?: SemesterRef[];
  [key: string]: unknown;
}

export interface StudentResultsResponse {
  data: StudentResults;
  meta?: StudentResultsMeta;
}

/* ------------------------------------------------------------------ */
/* Appréciations                                                       */
/* ------------------------------------------------------------------ */

export interface ReportCardCommentPayload {
  student_id: number;
  semester_id: number;
  subject_id: number | null;
  comment: string;
}

export interface ReportCardComment extends ReportCardCommentPayload {
  id: number;
  author_id?: number;
}

/* ------------------------------------------------------------------ */
/* Données de référence (sélecteurs)                                   */
/* ------------------------------------------------------------------ */

export interface AcademicYearOption {
  id: number;
  name: string;
  is_active: boolean;
  semesters: SemesterRef[];
}

export interface ClasseOption {
  id: number;
  name: string;
  academic_year_id: number;
  head_teacher_id?: number | null;
}

export interface TeacherOption {
  id: number;
  full_name: string;
}
