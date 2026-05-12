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

export interface ChildGrade {
  id: number;
  subject: string;
  score: number;
  max_score: number;
  semester: string;
  evaluation_date: string;
}

export interface ChildAttendanceRecord {
  id: number;
  date: string;
  status: 'Présent' | 'Absent' | 'Retard' | 'Excusé';
  notes?: string;
}

export interface ChildInvoice {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  description: string;
}

export interface ChildTimetableSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  classroom: string;
  teacher: string;
}

export interface ChildDocument {
  id: number;
  type: 'bulletin' | 'certificat' | 'attestation' | 'autre';
  title: string;
  download_url: string;
  generated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  published_at: string;
  category?: string;
}

export interface OnlinePaymentInitResponse {
  payment_id: number;
  transaction_id: string;
  invoice_id: number;
  student_id: number;
  amount: number;
  currency: string;
  method: 'mobile_money' | 'card';
  status: string;
  payment_url: string | null;
}

export interface OnlinePaymentStatus {
  payment_id: number;
  transaction_id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refused';
  amount: number;
  currency: string;
  cinetpay_transaction_id: string | null;
  notified_at: string | null;
}
