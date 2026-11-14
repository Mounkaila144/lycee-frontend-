// Types alignés sur le backend Laravel (Modules/Payroll).
// Les montants `decimal` sont sérialisés en chaîne par Laravel : toujours passer par Number().

export type Money = number | string;

// ──── Enums / Constants ────

export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
export type ContractType = 'permanent' | 'fixed_term' | 'temporary' | 'internship' | 'consultant' | 'part_time';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
export type ComponentType = 'bonus' | 'allowance' | 'deduction' | 'overtime' | 'commission' | 'benefit' | 'reimbursement';
export type CalculationType = 'fixed' | 'percentage' | 'hourly' | 'daily';
export type SalaryScaleType = 'teaching' | 'administrative' | 'technical' | 'management' | 'other';
export type AdvanceType = 'salary_advance' | 'loan' | 'emergency' | 'other';
export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'repaid' | 'cancelled';
export type DisbursementMethod = 'cash' | 'bank_transfer' | 'check';
export type PayrollPeriodStatus = 'draft' | 'in_progress' | 'calculated' | 'validated' | 'paid' | 'closed';
export type DeclarationType =
  | 'cnss'
  | 'amo'
  | 'cimr'
  | 'income_tax'
  | 'professional_tax'
  | 'training_tax'
  | 'annual_tax_summary';
export type DeclarationStatus = 'draft' | 'validated' | 'submitted' | 'accepted' | 'rejected' | 'paid';
export type DeclarationPaymentMethod = 'bank_transfer' | 'check' | 'online' | 'other';

export type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
  terminated: 'Sorti',
};

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, ChipColor> = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  terminated: 'error',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  permanent: 'CDI',
  fixed_term: 'CDD',
  temporary: 'Temporaire',
  internship: 'Stage',
  consultant: 'Consultant',
  part_time: 'Temps partiel',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  expired: 'Expiré',
  terminated: 'Résilié',
  renewed: 'Renouvelé',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, ChipColor> = {
  draft: 'default',
  active: 'success',
  expired: 'default',
  terminated: 'error',
  renewed: 'info',
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  bonus: 'Prime',
  allowance: 'Indemnité',
  deduction: 'Retenue',
  overtime: 'Heures supplémentaires',
  commission: 'Commission',
  benefit: 'Avantage',
  reimbursement: 'Remboursement',
};

export const CALCULATION_TYPE_LABELS: Record<CalculationType, string> = {
  fixed: 'Montant fixe',
  percentage: '% du salaire de base',
  hourly: 'Taux horaire',
  daily: 'Taux journalier',
};

export const SALARY_SCALE_TYPE_LABELS: Record<SalaryScaleType, string> = {
  teaching: 'Enseignant',
  administrative: 'Administratif',
  technical: 'Technique',
  management: 'Direction',
  other: 'Autre',
};

export const ADVANCE_TYPE_LABELS: Record<AdvanceType, string> = {
  salary_advance: 'Avance sur salaire',
  loan: 'Prêt',
  emergency: 'Urgence',
  other: 'Autre',
};

export const ADVANCE_STATUS_LABELS: Record<AdvanceStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  disbursed: 'Décaissée',
  repaying: 'En remboursement',
  repaid: 'Remboursée',
  cancelled: 'Annulée',
};

export const ADVANCE_STATUS_COLORS: Record<AdvanceStatus, ChipColor> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'error',
  disbursed: 'success',
  repaying: 'primary',
  repaid: 'default',
  cancelled: 'default',
};

export const PAYROLL_PERIOD_STATUS_LABELS: Record<PayrollPeriodStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  calculated: 'Calculée',
  validated: 'Validée',
  paid: 'Payée',
  closed: 'Clôturée',
};

export const PAYROLL_PERIOD_STATUS_COLORS: Record<PayrollPeriodStatus, ChipColor> = {
  draft: 'default',
  in_progress: 'info',
  calculated: 'primary',
  validated: 'warning',
  paid: 'success',
  closed: 'default',
};

/**
 * Libellés des types de déclaration. Les montants sont agrégés par code de cotisation
 * configuré dans « Paramètres de paie » ; les anciens types hérités restent lisibles.
 */
export const DECLARATION_TYPE_LABELS: Record<DeclarationType, string> = {
  cnss: 'Cotisations sociales (CNSS)',
  amo: 'Cotisation (ancien type)',
  cimr: 'Cotisation (ancien type)',
  income_tax: 'Impôt sur salaires (IUTS)',
  professional_tax: 'Taxe sur salaires (ancien type)',
  training_tax: 'Charges patronales additionnelles',
  annual_tax_summary: 'Récapitulatif annuel',
};

export const DECLARATION_STATUS_LABELS: Record<DeclarationStatus, string> = {
  draft: 'Brouillon',
  validated: 'Validée',
  submitted: 'Soumise',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
  paid: 'Payée',
};

export const DECLARATION_STATUS_COLORS: Record<DeclarationStatus, ChipColor> = {
  draft: 'default',
  validated: 'info',
  submitted: 'warning',
  accepted: 'primary',
  rejected: 'error',
  paid: 'success',
};

export const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// ──── Core Models ────

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cin: string | null;
  cnss_number: string | null;
  date_of_birth: string | null;
  hire_date: string;
  termination_date: string | null;
  department: string | null;
  position: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  status: EmployeeStatus;
  contracts?: Contract[];
  payroll_components?: PayrollComponent[];
  advances?: Advance[];
  created_at: string;
  updated_at: string;
}

export type EmployeeSummary = Pick<Employee, 'id' | 'employee_code' | 'first_name' | 'last_name' | 'email'>;

export interface Contract {
  id: number;
  employee_id: number;
  contract_number: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  weekly_hours: number;
  base_salary: Money;
  status: ContractStatus;
  signature_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryScaleGrade {
  grade: string;
  min_salary: number;
  max_salary: number;
}

export interface SalaryScale {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: SalaryScaleType;
  grades: SalaryScaleGrade[];
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

export interface PayrollComponent {
  id: number;
  employee_id: number;
  code: string;
  name: string;
  component_type: ComponentType;
  calculation_type: CalculationType;
  amount: Money | null;
  percentage: Money | null;
  rate: Money | null;
  frequency: string;
  is_recurring: boolean;
  valid_from: string | null;
  valid_to: string | null;
  status: 'draft' | 'active' | 'inactive';
  employee?: EmployeeSummary;
}

export interface Advance {
  id: number;
  employee_id: number;
  advance_number: string;
  advance_type: AdvanceType;
  amount: Money;
  reason: string;
  request_date: string;
  status: AdvanceStatus;
  number_of_installments: number | null;
  installment_amount: Money | null;
  balance: Money | null;
  total_repaid: Money | null;
  employee?: EmployeeSummary;
}

export interface PayrollRecord {
  id: number;
  payroll_period_id: number;
  employee_id: number;
  base_salary: Money;
  total_earnings: Money;
  gross_salary: Money;

  /** Total des cotisations salariales configurées. */
  cnss_employee: Money;
  income_tax: Money;
  net_taxable?: Money;

  /** Total des cotisations patronales configurées. */
  cnss_employer?: Money;
  advance_deductions: Money;
  total_deductions: Money;
  net_salary: Money;
  total_employer_charges: Money;
  total_cost: Money;
  status: string;
  payment_status: string;
  employee?: EmployeeSummary;
}

export interface Payslip {
  id: number;
  payroll_record_id: number;
  employee_id: number;
  payroll_period_id: number;
  payslip_number: string;
  issue_date: string;
  status: 'draft' | 'generated' | 'sent' | 'delivered';
}

export interface PayrollPeriod {
  id: number;
  period_code: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: PayrollPeriodStatus;
  total_employees: number | null;
  total_gross_salary: Money | null;
  total_deductions: Money | null;
  total_net_salary: Money | null;
  total_employer_charges: Money | null;
  calculated_at: string | null;
  validated_at: string | null;
  payroll_records?: PayrollRecord[];
  payslips?: Payslip[];
}

export interface BankTransfer {
  employee_code: string;
  employee_name: string;
  bank_account: string;
  rib: string | null;
  amount: Money;
  reference: string;
}

export interface SocialDeclaration {
  id: number;
  payroll_period_id: number | null;
  year: number;
  month: number | null;
  declaration_type: DeclarationType;
  declaration_number: string;
  declaration_date: string;
  due_date: string | null;
  total_employees: number | null;
  total_gross_salary: Money | null;
  total_amount_due: Money | null;
  status: DeclarationStatus;
  submission_reference: string | null;
  payment_amount: Money | null;
  payroll_period?: PayrollPeriod | null;
}

// ──── Requests ────

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  employee_code?: string;
  phone?: string;
  cin?: string;
  cnss_number?: string;
  department?: string;
  position?: string;
  bank_name?: string;
  bank_account_number?: string;
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest> & { status?: EmployeeStatus };

export interface CreateContractRequest {
  contract_type: ContractType;
  start_date: string;
  end_date?: string | null;
  base_salary: number;
  weekly_hours?: number;
}

export interface TerminateContractRequest {
  termination_date: string;
  reason: string;
}

export interface CreateSalaryScaleRequest {
  code: string;
  name: string;
  type: SalaryScaleType;
  grades: SalaryScaleGrade[];
  effective_from: string;
}

export interface CreatePayrollComponentRequest {
  employee_id: number;
  component_type: ComponentType;
  name: string;
  calculation_type: CalculationType;
  amount?: number | null;
  percentage?: number | null;
  rate?: number | null;
}

export interface CreateAdvanceRequest {
  employee_id: number;
  amount: number;
  advance_type: AdvanceType;
  reason: string;
  number_of_installments?: number;
}

export interface DisburseAdvanceRequest {
  method: DisbursementMethod;
  reference?: string;
}

export interface CreatePayrollPeriodRequest {
  year: number;
  month: number;
  payment_date: string;
}

export interface SubmitDeclarationRequest {
  reference: string;
  response?: string;
}

export interface DeclarationPaymentRequest {
  amount: number;
  method: DeclarationPaymentMethod;
  reference: string;
}

// ──── Filters ────

export interface EmployeeFilters {
  status?: EmployeeStatus;
  department?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PayrollPeriodFilters {
  year?: number;
  month?: number;
  status?: PayrollPeriodStatus;
}

export interface DeclarationFilters {
  type?: DeclarationType;
  year?: number;
  status?: DeclarationStatus;
  overdue_only?: boolean;
}

export interface AdvanceFilters {
  employee_id?: number;
  status?: AdvanceStatus;
}

export interface ComponentFilters {
  employee_id?: number;
  type?: ComponentType;
  active_only?: boolean;
}

// ──── Responses ────

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MessageResponse<T> {
  message: string;
  data: T;
}

export interface PayrollDashboard {
  current_period: PayrollPeriod | null;
  statistics: SalaryStatistics | null;
  recent_periods: PayrollPeriod[];
}

export interface PayrollJournalEmployee {
  employee_code: string;
  full_name: string;
  department: string | null;
  position: string | null;
  base_salary: Money;
  gross_salary: Money;
  deductions: { total: Money; [key: string]: Money };
  net_salary: Money;
  employer_charges: { total: Money; [key: string]: Money };
  total_cost: Money;
}

export interface ContributionReportLine {
  code: string;
  label: string;
  employee_rate: number | null;
  employer_rate: number | null;
  base_total: number;
  employee_amount: number;
  employer_amount: number;
  total: number;
}

export interface EmployerChargeReportLine {
  code: string;
  label: string;
  rate: number | null;
  amount: number;
}

/** Charges sociales et fiscales agrégées par code configuré (Paramètres de paie). */
export interface SocialChargesReport {
  period: { code: string; name: string; year: number; month: number };
  contributions: ContributionReportLine[];
  employer_charges: EmployerChargeReportLine[];
  taxes: { income_tax: Money; employer_charges: Money; total: Money };
  summary: {
    total_employee_contributions: Money;
    total_employer_contributions: Money;
    total_additional_employer_charges: Money;
    total_taxes: Money;
    grand_total: Money;
  };
}

// ──── Paramètres de paie (versionnés par date d'effet) ────

export interface PayrollContributionSetting {
  code: string;
  label: string;
  employee_rate: number;
  employer_rate: number;

  /** Plafond mensuel de l'assiette (null = pas de plafond). */
  ceiling: number | null;

  /** Plancher mensuel de l'assiette (null = aucun). */
  floor: number | null;
  active: boolean;

  /** Part salariale déductible de la base imposable. */
  tax_deductible: boolean;
}

export interface PayrollTaxBracket {
  from: number;

  /** null = dernière tranche, sans limite. */
  to: number | null;
  rate: number;
}

export interface PayrollEmployerChargeSetting {
  code: string;
  label: string;

  /** % de la masse salariale brute. */
  rate: number;
  active: boolean;
}

export interface PayrollSettings {
  country: string;
  currency: string;
  currency_label: string;
  rounding_precision: number;
  requires_review: boolean;
  review_notice: string | null;
  contributions: PayrollContributionSetting[];
  income_tax: {
    label: string;
    brackets: PayrollTaxBracket[];
    flat_allowance_rate: number;
    deduct_employee_contributions: boolean;
  };
  employer_charges: PayrollEmployerChargeSetting[];
}

export interface PayrollSettingsVersion {
  id: number | null;
  version: number | null;
  effective_date: string | null;
  is_default: boolean;
  settings: PayrollSettings;
  notes?: string | null;
  created_at?: string | null;
}

export interface PayrollSettingsOverview {
  current: PayrollSettingsVersion;
  upcoming: PayrollSettingsVersion[];
  storage_available: boolean;
}

export interface SavePayrollSettingsRequest {
  effective_date: string;
  notes?: string;
  settings: PayrollSettings;
}

export interface PayrollSimulationRequest {
  gross_salary: number;
  date?: string;
  settings?: PayrollSettings;
}

export interface PayrollSimulation {
  currency_label: string;
  gross_salary: number;
  contributions: {
    code: string;
    label: string;
    base: number;
    employee_rate: number;
    employer_rate: number;
    employee_amount: number;
    employer_amount: number;
    tax_deductible: boolean;
  }[];
  total_employee_contributions: number;
  total_employer_contributions: number;
  deductible_contributions: number;
  taxable_before_allowance: number;
  flat_allowance_rate: number;
  flat_allowance_amount: number;
  taxable_income: number;
  income_tax_label: string;
  income_tax_brackets: { from: number; to: number | null; rate: number; base: number; amount: number }[];
  income_tax: number;
  employer_charges: { code: string; label: string; rate: number; base: number; amount: number }[];
  total_additional_employer_charges: number;
  total_employer_charges: number;
  net_salary: number;
  employer_cost: number;
  settings_version: { id: number | null; version: number | null; effective_date: string | null; is_default: boolean; is_draft: boolean };
}

export interface PayrollJournal {
  period: { code: string; name: string; start_date: string; end_date: string; payment_date: string; status: string };
  summary: {
    total_employees: number | null;
    total_gross_salary: Money | null;
    total_deductions: Money | null;
    total_net_salary: Money | null;
    total_employer_charges: Money | null;
    total_cost: Money | null;
  };
  employees: PayrollJournalEmployee[];
  [key: string]: unknown;
}

/** Le backend renvoie `{ message }` quand aucune paie n'existe pour la période. */
export interface SalaryStatistics {
  message?: string;
  period?: string | number;
  overview?: {
    total_periods: number;
    total_employees: number;
    average_employees_per_period: number;
    total_payroll_cost: Money;
    average_monthly_cost: Money;
  };
  salary_distribution?: {
    average_base_salary: Money;
    median_base_salary: Money;
    min_base_salary: Money;
    max_base_salary: Money;
    average_gross_salary: Money;
    average_net_salary: Money;
  };
  deductions?: {
    total_deductions: Money;
    average_deductions: Money;
    deduction_rate: Money;
  };
  [key: string]: unknown;
}
