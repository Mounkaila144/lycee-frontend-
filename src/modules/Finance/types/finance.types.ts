// ──── Enums / Constants ────

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
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
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#9e9e9e',
  pending: '#1976d2',
  paid: '#4caf50',
  overdue: '#f44336',
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

export interface FeeType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  amount: number;
  currency: string;
  is_active: boolean;
  academic_year_id: number;
  created_at: string;
  updated_at: string;
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
  description?: string;
  amount: number;
  currency?: string;
  academic_year_id: number;
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

export interface AgingBalance {
  range: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface CashFlowForecast {
  month: string;
  expected_income: number;
  actual_income: number;
  expected_expenses: number;
  net_flow: number;
}

export interface UnpaidStatement {
  student: StudentSummary;
  total_invoiced: number;
  total_paid: number;
  total_remaining: number;
  overdue_invoices: number;
  oldest_due_date: string;
}

export interface FinanceDashboardData {
  total_revenue: number;
  total_outstanding: number;
  collection_rate: number;
  monthly_revenue: Array<{ month: string; amount: number }>;
  recent_payments: Payment[];
  overdue_invoices: Invoice[];
}

export interface PaymentJournalEntry {
  id: number;
  date: string;
  reference: string;
  student_name: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  method: PaymentMethod;
}

export interface AccountingExport {
  format: 'csv' | 'excel' | 'pdf';
  period_from: string;
  period_to: string;
  type: 'journal' | 'ledger' | 'trial_balance';
}
