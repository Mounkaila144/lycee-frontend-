// ──── Enums / Constants ────

export type ContractType = 'CDI' | 'CDD' | 'Interim' | 'Stage';
export type ContractStatus = 'active' | 'suspended' | 'terminated' | 'expired';
export type AmendmentStatus = 'pending' | 'approved' | 'rejected';
export type ComponentType = 'bonus' | 'allowance' | 'overtime' | 'deduction';
export type AdvanceStatus = 'requested' | 'approved' | 'disbursed' | 'rejected' | 'repaid';
export type PayrollPeriodStatus = 'draft' | 'calculated' | 'validated' | 'paid';
export type BankTransferStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type DeclarationType = 'CNSS' | 'income_tax' | 'AMO';
export type DeclarationStatus = 'draft' | 'validated' | 'submitted' | 'paid';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  Interim: 'Intérim',
  Stage: 'Stage',
};

export const CONTRACT_TYPE_COLORS: Record<ContractType, string> = {
  CDI: '#4caf50',
  CDD: '#1976d2',
  Interim: '#ff9800',
  Stage: '#9c27b0',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  terminated: 'Résilié',
  expired: 'Expiré',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  active: '#4caf50',
  suspended: '#ff9800',
  terminated: '#f44336',
  expired: '#9e9e9e',
};

export const AMENDMENT_STATUS_LABELS: Record<AmendmentStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  bonus: 'Prime',
  allowance: 'Indemnité',
  overtime: 'Heures supplémentaires',
  deduction: 'Retenue',
};

export const COMPONENT_TYPE_COLORS: Record<ComponentType, string> = {
  bonus: '#4caf50',
  allowance: '#1976d2',
  overtime: '#ff9800',
  deduction: '#f44336',
};

export const ADVANCE_STATUS_LABELS: Record<AdvanceStatus, string> = {
  requested: 'Demandé',
  approved: 'Approuvé',
  disbursed: 'Décaissé',
  rejected: 'Rejeté',
  repaid: 'Remboursé',
};

export const ADVANCE_STATUS_COLORS: Record<AdvanceStatus, string> = {
  requested: '#ff9800',
  approved: '#1976d2',
  disbursed: '#4caf50',
  rejected: '#f44336',
  repaid: '#9e9e9e',
};

export const PAYROLL_PERIOD_STATUS_LABELS: Record<PayrollPeriodStatus, string> = {
  draft: 'Brouillon',
  calculated: 'Calculé',
  validated: 'Validé',
  paid: 'Payé',
};

export const PAYROLL_PERIOD_STATUS_COLORS: Record<PayrollPeriodStatus, string> = {
  draft: '#9e9e9e',
  calculated: '#1976d2',
  validated: '#ff9800',
  paid: '#4caf50',
};

export const BANK_TRANSFER_STATUS_LABELS: Record<BankTransferStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  failed: 'Échoué',
};

export const DECLARATION_TYPE_LABELS: Record<DeclarationType, string> = {
  CNSS: 'CNSS',
  income_tax: 'Impôt sur le revenu',
  AMO: 'AMO',
};

export const DECLARATION_TYPE_COLORS: Record<DeclarationType, string> = {
  CNSS: '#1976d2',
  income_tax: '#ff9800',
  AMO: '#9c27b0',
};

export const DECLARATION_STATUS_LABELS: Record<DeclarationStatus, string> = {
  draft: 'Brouillon',
  validated: 'Validé',
  submitted: 'Soumis',
  paid: 'Payé',
};

export const DECLARATION_STATUS_COLORS: Record<DeclarationStatus, string> = {
  draft: '#9e9e9e',
  validated: '#1976d2',
  submitted: '#ff9800',
  paid: '#4caf50',
};

// ──── Summary Models ────

export interface EmployeeSummary {
  id: number;
  firstname: string;
  lastname: string;
  matricule: string;
  email?: string;
  phone?: string;
  photo?: string;
}

export interface DepartmentSummary {
  id: number;
  name: string;
  code: string;
}

// ──── Core Models ────

export interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  matricule: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  hire_date: string;
  department_id: number | null;
  position: string | null;
  photo: string | null;
  is_active: boolean;
  department?: DepartmentSummary;
  current_contract?: Contract;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  employee_id: number;
  type: ContractType;
  start_date: string;
  end_date: string | null;
  base_salary: number;
  status: ContractStatus;
  description: string | null;
  employee?: EmployeeSummary;
  amendments?: Amendment[];
  created_at: string;
  updated_at: string;
}

export interface Amendment {
  id: number;
  contract_id: number;
  field_changed: string;
  old_value: string;
  new_value: string;
  effective_date: string;
  reason: string | null;
  status: AmendmentStatus;
  approved_by: number | null;
  contract?: Contract;
  created_at: string;
  updated_at: string;
}

export interface SalaryScale {
  id: number;
  name: string;
  code: string;
  grade: string;
  echelon: number;
  base_amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollComponent {
  id: number;
  name: string;
  code: string;
  type: ComponentType;
  is_taxable: boolean;
  is_mandatory: boolean;
  default_amount: number | null;
  percentage: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Advance {
  id: number;
  employee_id: number;
  amount: number;
  reason: string | null;
  requested_date: string;
  approved_date: string | null;
  disbursed_date: string | null;
  repayment_months: number;
  status: AdvanceStatus;
  approved_by: number | null;
  employee?: EmployeeSummary;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  label: string;
  start_date: string;
  end_date: string;
  status: PayrollPeriodStatus;
  total_gross: number | null;
  total_net: number | null;
  total_deductions: number | null;
  employee_count: number | null;
  calculated_at: string | null;
  validated_at: string | null;
  paid_at: string | null;
  calculated_by: number | null;
  validated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Payslip {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  base_salary: number;
  gross_salary: number;
  net_salary: number;
  total_bonuses: number;
  total_deductions: number;
  cnss_employee: number;
  cnss_employer: number;
  income_tax: number;
  amo_employee: number;
  amo_employer: number;
  employee?: EmployeeSummary;
  payroll_period?: PayrollPeriod;
  components?: PayslipComponent[];
  created_at: string;
  updated_at: string;
}

export interface PayslipComponent {
  id: number;
  payslip_id: number;
  component_id: number;
  label: string;
  type: ComponentType;
  amount: number;
  component?: PayrollComponent;
}

export interface BankTransfer {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  bank_name: string;
  account_number: string;
  amount: number;
  reference: string;
  status: BankTransferStatus;
  transferred_at: string | null;
  employee?: EmployeeSummary;
  payroll_period?: PayrollPeriod;
  created_at: string;
  updated_at: string;
}

export interface SocialDeclaration {
  id: number;
  type: DeclarationType;
  period_month: number;
  period_year: number;
  label: string;
  total_base: number;
  total_employee_share: number;
  total_employer_share: number;
  total_amount: number;
  employee_count: number;
  status: DeclarationStatus;
  due_date: string;
  submitted_at: string | null;
  paid_at: string | null;
  reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnualSummary {
  year: number;
  employee_id: number;
  employee?: EmployeeSummary;
  total_gross: number;
  total_net: number;
  total_cnss: number;
  total_income_tax: number;
  total_amo: number;
  total_bonuses: number;
  total_deductions: number;
  months_worked: number;
}

// ──── Request Types ────

export interface CreateEmployeeRequest {
  firstname: string;
  lastname: string;
  matricule: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  hire_date: string;
  department_id?: number;
  position?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface CreateContractRequest {
  employee_id: number;
  type: ContractType;
  start_date: string;
  end_date?: string;
  base_salary: number;
  description?: string;
}

export interface CreateAmendmentRequest {
  contract_id: number;
  field_changed: string;
  old_value: string;
  new_value: string;
  effective_date: string;
  reason?: string;
}

export interface TerminateContractRequest {
  termination_date: string;
  reason: string;
}

export interface CreateSalaryScaleRequest {
  name: string;
  code: string;
  grade: string;
  echelon: number;
  base_amount: number;
  description?: string;
}

export interface CreatePayrollComponentRequest {
  name: string;
  code: string;
  type: ComponentType;
  is_taxable: boolean;
  is_mandatory: boolean;
  default_amount?: number;
  percentage?: number;
  description?: string;
}

export interface CreateAdvanceRequest {
  employee_id: number;
  amount: number;
  reason?: string;
  repayment_months: number;
}

export interface CreatePayrollPeriodRequest {
  month: number;
  year: number;
  start_date: string;
  end_date: string;
}

export interface CreateSocialDeclarationRequest {
  type: DeclarationType;
  period_month: number;
  period_year: number;
  due_date: string;
}

// ──── Filter Types ────

export interface EmployeeFilters {
  department_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface PayrollPeriodFilters {
  year?: number;
  status?: PayrollPeriodStatus;
}

export interface DeclarationFilters {
  type?: DeclarationType;
  status?: DeclarationStatus;
  year?: number;
}

export interface AdvanceFilters {
  employee_id?: number;
  status?: AdvanceStatus;
}

// ──── Response Types ────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PayrollDashboardStats {
  total_employees: number;
  active_contracts: number;
  total_payroll_cost: number;
  pending_advances: number;
  current_period_status: PayrollPeriodStatus | null;
}

export interface PayrollJournalEntry {
  employee: EmployeeSummary;
  base_salary: number;
  gross_salary: number;
  net_salary: number;
  total_bonuses: number;
  total_deductions: number;
}

export interface SocialChargesReport {
  period_label: string;
  cnss_total: number;
  income_tax_total: number;
  amo_total: number;
  grand_total: number;
}

export interface SalaryStatistics {
  average_salary: number;
  median_salary: number;
  min_salary: number;
  max_salary: number;
  total_mass: number;
  by_department: Array<{ department: string; average: number; count: number }>;
  by_contract_type: Array<{ type: ContractType; average: number; count: number }>;
}
