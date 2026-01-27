'use client';

import { useState, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type {
  ImportGradesPreviewResponse,
  ImportGradesResult,
} from '../../types/grade.types';

/**
 * Custom hook for grade import/export functionality
 */
export const useGradeImportExport = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // Export states
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  // Import states
  const [importing, setImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<Error | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [importPreview, setImportPreview] = useState<ImportGradesPreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportGradesResult | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);

  /**
   * Export grades template (empty or with current grades)
   */
  const exportTemplate = useCallback(
    async (evaluationId: number, filename?: string) => {
      try {
        setExporting(true);
        setExportError(null);

        const blob = await teacherGradeService.exportGradesTemplate(evaluationId, tenantId);

        // Download the file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `notes_evaluation_${evaluationId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setExportError(err instanceof Error ? err : new Error('Failed to export template'));
        console.error('Error exporting template:', err);
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  /**
   * Export absent students list
   */
  const exportAbsents = useCallback(
    async (evaluationId: number, filename?: string) => {
      try {
        setExporting(true);
        setExportError(null);

        const blob = await teacherGradeService.exportAbsentStudents(evaluationId, tenantId);

        // Download the file
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `absents_evaluation_${evaluationId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setExportError(err instanceof Error ? err : new Error('Failed to export absents'));
        console.error('Error exporting absents:', err);
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  /**
   * Preview import file
   */
  const previewImport = useCallback(
    async (evaluationId: number, file: File): Promise<ImportGradesPreviewResponse> => {
      try {
        setPreviewLoading(true);
        setImportError(null);
        setImportPreview(null);
        setImportResult(null);

        const preview = await teacherGradeService.previewGradesImport(evaluationId, file, tenantId);
        setImportPreview(preview);

        return preview;
      } catch (err) {
        setImportError(err instanceof Error ? err : new Error('Failed to preview import'));
        console.error('Error previewing import:', err);
        throw err;
      } finally {
        setPreviewLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Execute import
   */
  const executeImport = useCallback(
    async (evaluationId: number, overwriteExisting: boolean = false): Promise<ImportGradesResult> => {
      if (!uploadedFilePath) {
        throw new Error('No file uploaded');
      }

      try {
        setImporting(true);
        setImportError(null);

        const result = await teacherGradeService.importGrades(
          {
            evaluation_id: evaluationId,
            file_path: uploadedFilePath,
            overwrite_existing: overwriteExisting,
          },
          tenantId
        );

        setImportResult(result);

        return result;
      } catch (err) {
        setImportError(err instanceof Error ? err : new Error('Failed to import grades'));
        console.error('Error importing grades:', err);
        throw err;
      } finally {
        setImporting(false);
      }
    },
    [tenantId, uploadedFilePath]
  );

  /**
   * Reset import state
   */
  const resetImport = useCallback(() => {
    setImportError(null);
    setImportPreview(null);
    setImportResult(null);
    setUploadedFilePath(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setExportError(null);
    resetImport();
  }, [resetImport]);

  return {
    // Export
    exporting,
    exportError,
    exportTemplate,
    exportAbsents,

    // Import
    importing,
    previewLoading,
    importError,
    importPreview,
    importResult,
    previewImport,
    executeImport,
    resetImport,

    // General
    reset,
  };
};
