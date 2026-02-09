'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  PastedData,
  PastedRow,
  PasteFormat,
  BatchValidationResult,
  RowValidationResult,
  ParsedGradeValue,
  ValidatedBatchRow,
} from '../../types/batch.types';

/**
 * Parse clipboard data from text
 */
export function parseClipboardData(text: string): PastedData {
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    return {
      rows: [],
      format: 'single-column',
      columnCount: 0,
      hasHeaders: false,
    };
  }

  // Detect format based on tabs in first line
  const firstLine = lines[0];
  const hasTabs = firstLine.includes('\t');
  const format: PasteFormat = hasTabs ? 'multi-column' : 'single-column';

  // Parse rows
  const rows: PastedRow[] = lines.map((line, index) => {
    const values = hasTabs ? line.split('\t') : [line.trim()];
    return {
      values: values.map(v => v.trim()),
      format,
      rowIndex: index,
    };
  });

  // Detect headers (first row with non-numeric values)
  const hasHeaders = hasTabs && rows.length > 0 &&
    rows[0].values.some(v => isNaN(parseFloat(v)) && v.toUpperCase() !== 'ABS');

  const columnCount = rows.length > 0 ? Math.max(...rows.map(r => r.values.length)) : 0;

  return {
    rows: hasHeaders ? rows.slice(1) : rows,
    format,
    columnCount,
    hasHeaders,
    headers: hasHeaders ? rows[0].values : undefined,
  };
}

/**
 * Parse a single grade value
 */
export function parseGradeValue(value: string): ParsedGradeValue {
  const trimmed = value.trim().toUpperCase();

  // Empty value
  if (trimmed === '' || trimmed === '-') {
    return {
      rawValue: value,
      score: null,
      isAbsent: false,
      valid: true,
    };
  }

  // Absent marker
  if (trimmed === 'ABS' || trimmed === 'ABSENT' || trimmed === 'A') {
    return {
      rawValue: value,
      score: null,
      isAbsent: true,
      valid: true,
    };
  }

  // Parse as number (handle comma as decimal separator)
  const normalizedValue = trimmed.replace(',', '.');
  const num = parseFloat(normalizedValue);

  if (isNaN(num)) {
    return {
      rawValue: value,
      score: null,
      isAbsent: false,
      valid: false,
      error: `Valeur invalide: "${value}"`,
    };
  }

  if (num < 0) {
    return {
      rawValue: value,
      score: null,
      isAbsent: false,
      valid: false,
      error: `Note négative: ${num}`,
    };
  }

  if (num > 20) {
    return {
      rawValue: value,
      score: null,
      isAbsent: false,
      valid: false,
      error: `Note > 20: ${num}`,
    };
  }

  // Round to 2 decimal places
  const roundedScore = Math.round(num * 100) / 100;

  return {
    rawValue: value,
    score: roundedScore,
    isAbsent: false,
    valid: true,
  };
}

/**
 * Validate batch pasted data
 */
export function validateBatchData(
  data: PastedData,
  scoreColumnIndex: number = 0
): BatchValidationResult {
  const errors: RowValidationResult[] = [];
  const validData: ValidatedBatchRow[] = [];

  data.rows.forEach((row, index) => {
    const parsedValues: ParsedGradeValue[] = row.values.map(v => parseGradeValue(v));
    const rowErrors: string[] = [];

    // Get the score value from the specified column
    const scoreValue = parsedValues[scoreColumnIndex];

    if (scoreValue && !scoreValue.valid) {
      rowErrors.push(scoreValue.error || 'Erreur de validation');
    }

    const result: RowValidationResult = {
      rowIndex: index,
      lineNumber: index + 1,
      valid: rowErrors.length === 0,
      errors: rowErrors,
      parsedValues,
    };

    if (!result.valid) {
      errors.push(result);
    } else if (scoreValue) {
      validData.push({
        rowIndex: index,
        score: scoreValue.score,
        isAbsent: scoreValue.isAbsent,
      });
    }
  });

  return {
    totalRows: data.rows.length,
    validRows: validData.length,
    invalidRows: errors.length,
    errors,
    validData,
  };
}

/**
 * Hook for handling clipboard paste in grade entry
 */
export const useClipboardPaste = (options?: {
  enabled?: boolean;
  onPaste?: (data: PastedData, validation: BatchValidationResult) => void;
  maxRows?: number;
}) => {
  const { enabled = true, onPaste, maxRows = 500 } = options || {};

  const [pastedData, setPastedData] = useState<PastedData | null>(null);
  const [validation, setValidation] = useState<BatchValidationResult | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  /**
   * Handle paste event
   */
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!enabled) return;

      // Only handle paste when not in a regular input field
      const target = e.target as Node;
      const isElement = target && 'tagName' in target;
      const isInInput = isElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      const isGradeInput = isElement && 'closest' in target ? (target as HTMLElement).closest('[data-grade-cell]') : null;

      // Allow paste in grade cells but handle multi-line paste specially
      if (isInInput && !isGradeInput) return;

      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;

      // Check if it's multi-line paste
      const hasMultipleLines = text.includes('\n');
      if (!hasMultipleLines && isGradeInput) {
        // Let the regular input handle single value paste
        return;
      }

      // Prevent default for multi-line paste
      if (hasMultipleLines) {
        e.preventDefault();
      }

      try {
        setIsPasting(true);
        setPasteError(null);

        const data = parseClipboardData(text);

        // Check max rows
        if (data.rows.length > maxRows) {
          setPasteError(`Trop de lignes (max ${maxRows}). Vous avez collé ${data.rows.length} lignes.`);
          return;
        }

        const validationResult = validateBatchData(data);

        setPastedData(data);
        setValidation(validationResult);

        if (onPaste) {
          onPaste(data, validationResult);
        }
      } catch (err) {
        setPasteError(err instanceof Error ? err.message : 'Erreur lors du collage');
      } finally {
        setIsPasting(false);
      }
    },
    [enabled, maxRows, onPaste]
  );

  /**
   * Clear paste data
   */
  const clearPaste = useCallback(() => {
    setPastedData(null);
    setValidation(null);
    setPasteError(null);
  }, []);

  // Add paste event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [enabled, handlePaste]);

  return {
    pastedData,
    validation,
    isPasting,
    pasteError,
    clearPaste,
    // Utility functions
    parseClipboardData,
    parseGradeValue,
    validateBatchData,
  };
};
