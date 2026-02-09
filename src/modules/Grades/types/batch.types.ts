/**
 * Grades Module - Batch Entry Types
 * Types for batch grade entry via clipboard paste
 */

/**
 * Format of pasted data
 */
export type PasteFormat = 'single-column' | 'multi-column';

/**
 * A single row of pasted data
 */
export interface PastedRow {
  values: string[];
  format: PasteFormat;
  rowIndex: number;
}

/**
 * Parsed clipboard data
 */
export interface PastedData {
  rows: PastedRow[];
  format: PasteFormat;
  columnCount: number;
  hasHeaders: boolean;
  headers?: string[];
}

/**
 * Validation result for a single row
 */
export interface RowValidationResult {
  rowIndex: number;
  lineNumber: number;
  valid: boolean;
  errors: string[];
  parsedValues: ParsedGradeValue[];
}

/**
 * Parsed grade value from clipboard
 */
export interface ParsedGradeValue {
  rawValue: string;
  score: number | null;
  isAbsent: boolean;
  comment?: string;
  valid: boolean;
  error?: string;
}

/**
 * Overall batch validation result
 */
export interface BatchValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: RowValidationResult[];
  validData: ValidatedBatchRow[];
}

/**
 * Validated batch row ready for submission
 */
export interface ValidatedBatchRow {
  rowIndex: number;
  studentId?: number;
  matricule?: string;
  score: number | null;
  isAbsent: boolean;
  comment?: string;
}

/**
 * Column mapping for multi-column paste
 */
export interface ColumnMapping {
  columnIndex: number;
  field: 'matricule' | 'name' | 'score' | 'absent' | 'comment' | 'ignore';
  evaluationId?: number;
}

/**
 * Batch paste preview data
 */
export interface BatchPastePreview {
  data: PastedData;
  validation: BatchValidationResult;
  mappings: ColumnMapping[];
  conflicts: BatchConflict[];
}

/**
 * Conflict when pasting over existing grades
 */
export interface BatchConflict {
  rowIndex: number;
  studentId: number;
  studentName: string;
  matricule: string;
  existingScore: number | null;
  existingIsAbsent: boolean;
  newScore: number | null;
  newIsAbsent: boolean;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'overwrite' | 'skip' | 'overwrite-all' | 'skip-all';

/**
 * Batch grades request payload
 */
export interface BatchGradesRequest {
  grades: BatchGradeItem[];
  overwrite_existing: boolean;
}

/**
 * Single item in batch request
 */
export interface BatchGradeItem {
  student_id?: number;
  matricule?: string;
  score: number | null;
  is_absent: boolean;
  comment?: string;
}

/**
 * Batch grades response
 */
export interface BatchGradesResponse {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: BatchError[];
}

/**
 * Error in batch processing
 */
export interface BatchError {
  rowIndex?: number;
  matricule?: string;
  message: string;
}

/**
 * Keyboard navigation state
 */
export interface KeyboardNavState {
  focusedRowIndex: number | null;
  focusedField: 'score' | 'absent' | 'comment' | null;
  isEditing: boolean;
}
