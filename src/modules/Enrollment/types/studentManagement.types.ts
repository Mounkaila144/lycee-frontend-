/**
 * Gestion de l'élève par l'administration (Admin | Manager) — contrats de
 * /admin/enrollment/students/{id}/class-enrollments | change-class | parents | account
 * /admin/enrollment/parents (recherche) et /admin/enrollment/parents/{id}/account
 */

export type ClassEnrollmentStatus = 'Actif' | 'Terminé' | 'Transféré' | 'Annulé';

export interface StudentClassEnrollment {
  id: number;
  student_id: number;
  classe_id: number;
  classe: { id: number; name: string; max_capacity: number | null } | null;
  academic_year_id: number;
  academic_year: { id: number; name: string; is_active: boolean } | null;
  assignment_type: string;
  status: ClassEnrollmentStatus;
  enrolled_at: string | null;
  final_decision: string | null;
  notes: string | null;
}

export interface PortalAccount {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  lastlogin: string | null;
  created_at: string | null;
  roles: string[];
}

/** Réponse de création / réinitialisation : le mot de passe n'est renvoyé qu'une fois. */
export interface PortalAccountCredentials {
  account: PortalAccount;
  password: string;
}

export type ParentRelationship = 'Père' | 'Mère' | 'Tuteur' | 'Tutrice' | 'Autre';

export const PARENT_RELATIONSHIPS: ParentRelationship[] = ['Père', 'Mère', 'Tuteur', 'Tutrice', 'Autre'];

export interface StudentParent {
  id: number;
  firstname: string;
  lastname: string;
  full_name: string;
  relationship: ParentRelationship;
  phone: string;
  phone_secondary: string | null;
  email: string | null;
  profession: string | null;
  address: string | null;

  /** null hors contexte d'un élève (recherche) */
  is_primary_contact: boolean | null;
  is_financial_responsible: boolean | null;
  children_count: number | null;
  account: PortalAccount | null;
}

export interface StudentParentFormData {
  firstname: string;
  lastname: string;
  relationship: ParentRelationship;
  phone: string;
  phone_secondary?: string;
  email?: string;
  profession?: string;
  address?: string;
  is_primary_contact?: boolean;
  is_financial_responsible?: boolean;
}
