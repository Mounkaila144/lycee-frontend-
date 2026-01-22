/**
 * Enrollment Module - Student Card Types
 * Types for student card generation and verification
 */

/**
 * Card Status
 */
export type CardStatus = 'Active' | 'Expired' | 'Suspended' | 'Revoked';

/**
 * Print Status
 */
export type CardPrintStatus = 'Pending' | 'Printed' | 'Delivered';

/**
 * Student Card Entity
 */
export interface StudentCard {
  id: number;
  student_id: number;
  academic_year_id: number;
  card_number: string;
  qr_code_data: string;
  qr_signature: string;
  pdf_path: string | null;
  status: CardStatus;
  issued_at: string;
  valid_until: string;
  is_duplicate: boolean;
  original_card_id: number | null;
  print_status: CardPrintStatus;
  printed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations
  student?: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    photo?: string;
    sex: string;
    birthdate: string;
  };
  academic_year?: {
    id: number;
    year: string;
    name: string;
  };
  program?: {
    id: number;
    code: string;
    name: string;
  };
  level?: string;
  original_card?: StudentCard;
}

/**
 * Generate Card Request
 */
export interface GenerateCardRequest {
  student_id: number;
  academic_year_id: number;
}

/**
 * Batch Generate Cards Request
 */
export interface BatchGenerateCardsRequest {
  student_ids: number[];
  academic_year_id: number;
}

/**
 * Batch Generate Cards Result
 */
export interface BatchGenerateCardsResult {
  success: number;
  failed: number;
  cards: StudentCard[];
  errors: {
    student_id: number;
    student_name: string;
    error: string;
  }[];
}

/**
 * Generate Duplicate Request
 */
export interface GenerateDuplicateRequest {
  card_id: number;
  reason?: string;
}

/**
 * Update Card Status Request
 */
export interface UpdateCardStatusRequest {
  status: CardStatus;
  reason?: string;
}

/**
 * Update Print Status Request
 */
export interface UpdatePrintStatusRequest {
  print_status: CardPrintStatus;
}

/**
 * QR Code Data (parsed)
 */
export interface QRCodeData {
  card_number: string;
  matricule: string;
  student_id: number;
  firstname: string;
  lastname: string;
  program: string;
  level: string;
  valid_until: string;
  issued_at: string;
}

/**
 * Verify Card Request
 */
export interface VerifyCardRequest {
  qr_data: string;
  signature: string;
}

/**
 * Verify Card Response
 */
export interface VerifyCardResponse {
  valid: boolean;
  student: {
    id: number;
    matricule: string;
    firstname: string;
    lastname: string;
    email: string;
    photo?: string;
    program: string;
    level: string;
  };
  card: StudentCard;
  message?: string;
}

/**
 * Card Filters
 */
export interface CardFilters {
  student_id?: number;
  academic_year_id?: number;
  status?: CardStatus;
  print_status?: CardPrintStatus;
  is_duplicate?: boolean;
  search?: string;
}

/**
 * Card Query Params
 */
export interface CardQueryParams extends CardFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated Cards Response
 */
export interface PaginatedCardsResponse {
  data: StudentCard[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Card Statistics
 */
export interface CardStatistics {
  total: number;
  by_status: {
    active: number;
    expired: number;
    suspended: number;
    revoked: number;
  };
  by_print_status: {
    pending: number;
    printed: number;
    delivered: number;
  };
  duplicates: number;
  issued_this_month: number;
}

/**
 * My Card Response (Frontend student)
 */
export interface MyCardResponse {
  card: StudentCard | null;
  can_request_duplicate: boolean;
  history: StudentCard[];
}

/**
 * Scan Log
 */
export interface CardScanLog {
  id: number;
  card_id: number;
  scanned_at: string;
  scanned_by?: number;
  location?: string;
  result: 'valid' | 'invalid' | 'expired' | 'suspended' | 'revoked';
}

/**
 * Print Batch Request
 */
export interface PrintBatchRequest {
  card_ids: number[];
  format: 'individual' | 'sheet_8'; // individual or 8 cards per A4
}
