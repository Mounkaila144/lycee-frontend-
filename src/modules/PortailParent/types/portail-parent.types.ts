/**
 * Types — Portail Parent (Stories Parent 01-09).
 *
 * Reflète les Resources backend `Modules/PortailParent/Http/Resources/*`.
 */

export interface ParentProfile {
  id: number;
  firstname: string;
  lastname: string;
  full_name: string;
  relationship: 'Père' | 'Mère' | 'Tuteur' | 'Tutrice' | 'Autre';
  phone: string;
  phone_secondary?: string | null;
  email?: string | null;
  profession?: string | null;
  address?: string | null;
  children_count?: number;
}

export interface ChildSummary {
  id: number;
  matricule: string | null;
  firstname: string;
  lastname: string;
  full_name: string;
  birthdate: string | null;
  sex: 'M' | 'F';
  nationality: string | null;
  photo_url: string | null;
  status: string;
  pivot?: {
    is_primary_contact: boolean;
    is_financial_responsible: boolean;
  };
}

export interface ChildAttendanceRecord {
  id: number;
  date: string | null;
  subject: string | null;
  start_time: string | null;
  end_time: string | null;
  status: 'Présent' | 'Absent' | 'Retard' | 'Excusé';
  delay_minutes: number | null;
  notes: string | null;
}

export interface ChildInvoicePayment {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string;
  receipt_number: string | null;
}

export interface ChildInvoice {
  id: number;
  invoice_number: string;
  description: string | null;
  amount: number;
  paid_amount: number;
  balance: number;
  currency: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string | null;
  due_date: string | null;
  payments: ChildInvoicePayment[];
}

export interface ChildTimetableSlot {
  id: number;
  day: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  subject_code: string | null;
  classroom: string | null;
  teacher: string | null;
  classe: string | null;
  type: string;
}

export interface ChildDocument {
  id: number;
  type: string;
  title: string;
  document_number: string | null;
  download_url: string | null;
  generated_at: string | null;
}

/** Annonce de l'établissement (module Messaging) — GET /admin/parent/announcements. */
export type { Announcement } from '@/modules/Messaging/types/announcement.types';
