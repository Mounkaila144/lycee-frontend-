export interface StudentClasseSummary {
  id: number;
  name: string | null;
  academic_year: string | null;
}

export interface StudentProfile {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  full_name: string;
  birthdate: string | null;
  birthplace: string | null;
  sex: string | null;
  phone: string | null;
  status: string | null;
  [key: string]: unknown;
}

export interface StudentTimetableSlot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string | null;
  teacher: string | null;
  room: string | null;
  type: string | null;
}

export interface StudentDashboard {
  student: StudentProfile;
  classe: StudentClasseSummary | null;

  /** Moyenne générale du semestre actif (évaluations publiées) — décimal possiblement sérialisé en chaîne. */
  moyenne_actuelle: number | string | null;
  average?: number | string | null;
  next_class: StudentTimetableSlot | null;
  recent_absences_count: number;
  pending_invoices_count: number;
  balance_due: number;
  currency: string;
  available_documents_count: number;
}

export interface StudentAttendanceRecord {
  id: number;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  subject: string | null;
  status: 'present' | 'absent' | 'late' | 'excused' | string;
  status_label: string;
  delay_minutes: number | null;
  notes: string | null;
}

export interface StudentInvoicePayment {
  id: number;
  payment_date: string | null;
  amount: number;
  payment_method: string | null;
  receipt_number: string | null;
}

export interface StudentInvoice {
  id: number;
  invoice_number: string;
  academic_year: string | null;
  invoice_date: string | null;
  due_date: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  items: { description: string | null; fee_type: string | null; amount: number; discount_amount: number }[];
  payments: StudentInvoicePayment[];
}

export interface StudentDocument {
  id: number;
  source: 'official' | 'dossier';
  type: string;
  title: string;
  document_number: string | null;
  date: string | null;
  is_validated: boolean;
  download_url: string | null;
}

export interface StudentCard {
  student_id: number;
  matricule: string;
  full_name: string;
  classe: StudentClasseSummary | null;
  card_status: string;
  card_number: string | null;
  issued_at: string | null;
  valid_until: string | null;
  pdf_url: string | null;
}

export interface StudentReenrollmentCampaign {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface StudentReenrollment {
  student_id: number;
  open_campaigns: StudentReenrollmentCampaign[];
  eligible: boolean;
}
