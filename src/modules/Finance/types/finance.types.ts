// ──── Enums / Constants ────

export type InvoiceStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RefundStatus = 'pending' | 'approved' | 'processed' | 'rejected';
export type ReminderStatus = 'pending' | 'sent' | 'acknowledged' | 'escalated';
export type ReminderType = 'email' | 'sms' | 'letter' | 'phone';
export type ServiceBlockStatus = 'active' | 'lifted' | 'expired';
export type PaymentPlanStatus = 'active' | 'completed' | 'defaulted' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed';
export type WriteOffStatus = 'pending' | 'approved' | 'rejected';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  partial: 'Partiellement payée',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#9e9e9e',
  pending: '#1976d2',
  paid: '#4caf50',
  overdue: '#f44336',
  partial: '#ff9800',
  cancelled: '#757575',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  mobile_money: 'Mobile Money',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: '#4caf50',
  bank_transfer: '#1976d2',
  check: '#ff9800',
  mobile_money: '#9c27b0',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: '#ff9800',
  completed: '#4caf50',
  failed: '#f44336',
  refunded: '#9c27b0',
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  processed: 'Traité',
  rejected: 'Rejeté',
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  acknowledged: 'Accusé',
  escalated: 'Escaladé',
};

export const REMINDER_STATUS_COLORS: Record<ReminderStatus, string> = {
  pending: '#ff9800',
  sent: '#1976d2',
  acknowledged: '#4caf50',
  escalated: '#f44336',
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  email: 'Email',
  sms: 'SMS',
  letter: 'Courrier',
  phone: 'Téléphone',
};

export const SERVICE_BLOCK_STATUS_LABELS: Record<ServiceBlockStatus, string> = {
  active: 'Actif',
  lifted: 'Levé',
  expired: 'Expiré',
};

export const SERVICE_BLOCK_STATUS_COLORS: Record<ServiceBlockStatus, string> = {
  active: '#f44336',
  lifted: '#4caf50',
  expired: '#9e9e9e',
};

export const PAYMENT_PLAN_STATUS_LABELS: Record<PaymentPlanStatus, string> = {
  active: 'Actif',
  completed: 'Terminé',
  defaulted: 'En défaut',
  cancelled: 'Annulé',
};

export const PAYMENT_PLAN_STATUS_COLORS: Record<PaymentPlanStatus, string> = {
  active: '#1976d2',
  completed: '#4caf50',
  defaulted: '#f44336',
  cancelled: '#9e9e9e',
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: 'Pourcentage',
  fixed: 'Montant fixe',
};

export const WRITE_OFF_STATUS_LABELS: Record<WriteOffStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

// ──── Summary Models ────

export interface StudentSummary {
  id: number;
  firstname: string;
  lastname: string;
  matricule?: string;
  email?: string;
  photo?: string;
}

// ──── Core Models ────

export type FeeTypeCategory =
  | 'tuition'
  | 'registration'
  | 'exam'
  | 'library'
  | 'lab'
  | 'sports'
  | 'insurance'
  | 'card'
  | 'other';

export const FEE_TYPE_CATEGORY_LABELS: Record<FeeTypeCategory, string> = {
  tuition: 'Scolarité',
  registration: 'Inscription',
  exam: 'Examen',
  library: 'Bibliothèque',
  lab: 'Laboratoire',
  sports: 'Sport',
  insurance: 'Assurance',
  card: 'Carte scolaire',
  other: 'Autre (APE, tenue…)',
};

export interface FeeTypeAppliesTo {

  /** Codes de niveau concernés (vide = tous les niveaux) */
  levels?: string[];

  /** Montant spécifique par code de niveau (sinon montant par défaut) */
  level_amounts?: Record<string, number>;
  [key: string]: unknown;
}

export interface FeeType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  default_amount: number | string;
  category: FeeTypeCategory;
  is_mandatory: boolean;
  is_active: boolean;
  applies_to: FeeTypeAppliesTo | null;
  academic_year_id: number | null;
  academic_year?: { id: number; name: string } | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;

  /** @deprecated champ historique — utiliser default_amount */
  amount?: number;
}

export interface FeeTypeListParams {
  include_inactive?: boolean;
  academic_year_id?: number;
  category?: FeeTypeCategory;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  fee_type_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  fee_type?: FeeType;
}

export interface Invoice {
  id: number;
  reference: string;
  student_id: number;
  academic_year_id: number;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: InvoiceStatus;
  due_date: string;
  issued_date: string;
  notes: string | null;
  items: InvoiceItem[];
  student?: StudentSummary;
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  reference: string;
  invoice_id: number;
  student_id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference: string | null;
  payment_date: string;
  notes: string | null;
  receipt_number: string | null;
  received_by: number | null;
  invoice?: Invoice;
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: number;
  invoice_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  is_paid: boolean;
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: number;
  payment_id: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  processed_by: number | null;
  processed_at: string | null;
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface Discount {
  id: number;
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  student_id: number | null;
  fee_type_id: number | null;
  academic_year_id: number;
  is_active: boolean;
  student?: StudentSummary;
  fee_type?: FeeType;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  invoice_id: number;
  student_id: number;
  type: ReminderType;
  status: ReminderStatus;
  message: string;
  sent_at: string | null;
  acknowledged_at: string | null;
  escalation_level: number;
  invoice?: Invoice;
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface ServiceBlock {
  id: number;
  student_id: number;
  reason: string;
  blocked_services: string[];
  status: ServiceBlockStatus;
  blocked_at: string;
  lifted_at: string | null;
  lifted_by: number | null;
  student?: StudentSummary;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: number;
  student_id: number;
  invoice_id: number;
  total_amount: number;
  installments_count: number;
  installment_amount: number;
  start_date: string;
  status: PaymentPlanStatus;
  schedules: PaymentSchedule[];
  student?: StudentSummary;
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

export interface WriteOff {
  id: number;
  invoice_id: number;
  amount: number;
  reason: string;
  status: WriteOffStatus;
  approved_by: number | null;
  approved_at: string | null;
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

// ──── Request Types ────

export interface CreateFeeTypeRequest {
  name: string;
  code: string;
  description?: string | null;
  default_amount: number;
  category: FeeTypeCategory;
  is_mandatory?: boolean;
  academic_year_id?: number | null;
  levels?: string[];
  level_amounts?: Record<string, number | null>;
}

export interface UpdateFeeTypeRequest extends Partial<CreateFeeTypeRequest> {}

export interface CreateInvoiceRequest {
  student_id: number;
  academic_year_id: number;
  due_date: string;
  notes?: string;
  items: Array<{
    fee_type_id: number;
    quantity: number;
    unit_price: number;
  }>;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface GenerateAutomatedInvoicesRequest {
  academic_year_id: number;
  fee_type_ids: number[];
  student_ids?: number[];
  due_date: string;
}

export interface RecordPaymentRequest {
  invoice_id: number;
  amount: number;
  method: PaymentMethod;
  transaction_reference?: string;
  payment_date: string;
  notes?: string;
}

export interface CreateRefundRequest {
  payment_id: number;
  amount: number;
  reason: string;
}

export interface CreateReminderRequest {
  invoice_id: number;
  type: ReminderType;
  message: string;
}

export interface CreateServiceBlockRequest {
  student_id: number;
  reason: string;
  blocked_services: string[];
}

export interface CreatePaymentPlanRequest {
  student_id: number;
  invoice_id: number;
  installments_count: number;
  start_date: string;
}

export interface CreateWriteOffRequest {
  invoice_id: number;
  amount: number;
  reason: string;
}

export interface CreateDiscountRequest {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  student_id?: number;
  fee_type_id?: number;
  academic_year_id: number;
}

// ──── Filter Types ────

export interface InvoiceFilters {
  academic_year_id?: number;
  student_id?: number;
  status?: InvoiceStatus;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PaymentFilters {
  invoice_id?: number;
  student_id?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface ReminderFilters {
  student_id?: number;
  status?: ReminderStatus;
  type?: ReminderType;
  page?: number;
  per_page?: number;
}

export interface CollectionFilters {
  academic_year_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

// ──── Response Types ────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface InvoiceStatistics {
  total_invoiced: number;
  total_paid: number;
  total_overdue: number;
  total_pending: number;
  collection_rate: number;
  invoices_count: number;
  paid_count: number;
  overdue_count: number;
}

export interface DailySummary {
  date: string;
  total_payments: number;
  total_amount: number;
  by_method: Array<{ method: PaymentMethod; count: number; amount: number }>;
}

export interface ReconciliationReport {
  date: string;
  expected_amount: number;
  received_amount: number;
  difference: number;
  unmatched_payments: number;
}

export interface CollectionStatistics {
  total_outstanding: number;
  total_reminders_sent: number;
  total_service_blocks: number;
  total_payment_plans: number;
  total_write_offs: number;
  recovery_rate: number;
  average_days_overdue: number;
}

// ──── Finance reports (GET /admin/finance/reports/*) ────
// Montants : les décimaux Laravel sont sérialisés en chaîne ("72500.00").

export type ReportAmount = number | string;

export interface AgingBucket {
  count: number;
  amount: ReportAmount;
  invoices: Array<{ invoice_number: string; student: string; amount: ReportAmount; days_overdue: number }>;
}

export type AgingBucketKey = 'current' | '0-30' | '31-60' | '61-90' | '91-120' | '120+';

export interface AgingBalance {
  aging: Record<AgingBucketKey, AgingBucket>;
  total_outstanding: ReportAmount;
  generated_at: string;
}

export interface CashFlowForecastMonth {
  month: string;
  expected_collections: ReportAmount;
  scheduled_payments: ReportAmount;
  historical_average: ReportAmount;
  confidence: 'high' | 'medium' | 'low';
}

export interface CashFlowForecast {
  forecast: CashFlowForecastMonth[];
  total_expected: ReportAmount;
}

export interface UnpaidStatement {
  student: { id: number; matricule: string; firstname: string; lastname: string; email?: string | null };
  total_debt: ReportAmount;
  invoices_count: number;
  oldest_due_date: string;
  invoices: Array<{
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: ReportAmount;
    paid_amount: ReportAmount;
    balance: ReportAmount;
    status: string;
    days_overdue: number;
  }>;
}

export interface UnpaidStatementsReport {
  statements: UnpaidStatement[];
  summary: { total_students: number; total_invoices: number; total_amount: ReportAmount };
}

export interface FinanceDashboardData {
  summary: {
    total_invoiced: ReportAmount;
    total_paid: ReportAmount;
    total_outstanding: ReportAmount;
    total_overdue: ReportAmount;
    collection_rate: number;
  };
  current_month: {
    invoiced: ReportAmount;
    collected: ReportAmount;
    by_method: Record<string, ReportAmount> | [];
  };
  trends: Array<{ month: string; collected: ReportAmount }>;
}

export interface PaymentJournalEntry {
  id: number;
  invoice_id: number;
  student_id: number;
  payment_date: string;
  amount: ReportAmount;
  payment_method: string;
  reference_number?: string | null;
  receipt_number?: string | null;
  notes?: string | null;
  recorded_by?: { id: number; username: string; firstname?: string | null; lastname?: string | null } | null;
  invoice?: {
    id: number;
    invoice_number: string;
    student?: { id: number; matricule: string; firstname: string; lastname: string } | null;
  } | null;
}

export interface PaymentJournal {
  payments: PaymentJournalEntry[];
  summary: {
    total_count: number;
    total_amount: ReportAmount;
    daily_totals: Record<string, { count: number; amount: ReportAmount }> | [];
  };
  period: { start_date: string; end_date: string };
}

export interface AccountingExportParams {
  start_date: string;
  end_date: string;
  format?: 'sage' | 'ciel' | 'custom';
}

export interface AccountingExport {
  format: string;
  period: { start_date: string; end_date: string };
  entries: Array<{
    date: string;
    reference: string;
    account_debit: string;
    account_credit: string;
    amount: ReportAmount;
    description: string;
    student_matricule?: string | null;
  }>;
  summary: { total_entries: number; total_amount: ReportAmount };
}

// ──── Facturation en masse ────

export type BulkBillingScope = 'classe' | 'level' | 'year';

export interface BulkBillingTargets {
  academic_year: { id: number; name: string };
  levels: Array<{ id: number; code: string; name: string; students_count: number }>;
  classes: Array<{ id: number; name: string; level_id: number; level_code: string | null; students_count: number }>;
  total_students: number;
}

export interface BulkBillingRequest {
  academic_year_id: number;
  scope: BulkBillingScope;
  classe_id?: number | null;
  level_id?: number | null;
  fee_type_ids: number[];
  invoice_date?: string;
  due_date: string;
  notes?: string;
}

export type BulkBillingLineStatus = 'to_invoice' | 'already_invoiced' | 'not_applicable';

export interface BulkBillingSummary {
  students_count: number;
  invoices_count: number;
  skipped_students_count: number;
  already_invoiced_lines_count: number;
  not_applicable_lines_count: number;
  total_amount: number;
}

export interface BulkBillingPreviewStudent {
  student_id: number;
  matricule: string | null;
  student_name: string;
  classe_id: number;
  classe_name: string | null;
  level_code: string | null;
  items: Array<{
    fee_type_id: number;
    name: string;
    status: BulkBillingLineStatus;
    amount: number;
    discount_amount: number;
    net_amount: number;
  }>;
  total_amount: number;
  will_invoice: boolean;
}

export interface BulkBillingPreview {
  summary: BulkBillingSummary;
  students: BulkBillingPreviewStudent[];
}

export interface BulkBillingResult {
  summary: BulkBillingSummary;
  invoices: Array<{
    id: number;
    invoice_number: string;
    student_id: number;
    student_name: string;
    classe_name: string | null;
    total_amount: number;
  }>;
}
