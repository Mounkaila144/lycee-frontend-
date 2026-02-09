'use client';

import { useState, useCallback } from 'react';
import { useTenant } from '@/shared/lib/tenant-context';
import { teacherGradeService } from '../services/teacherGradeService';
import type {
  GradeHistory,
  RequestGradeCorrectionPayload,
  RequestGradeCorrectionResponse,
} from '../../types/validation.types';

/**
 * Hook for grade correction requests and history (teacher-side)
 */
export const useGradeCorrection = () => {
  const { tenantId: rawTenantId } = useTenant();
  const tenantId = rawTenantId ?? undefined;

  // History state
  const [history, setHistory] = useState<GradeHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<Error | null>(null);

  // Correction request state
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const [requestResult, setRequestResult] = useState<RequestGradeCorrectionResponse | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  /**
   * Fetch history for a specific grade
   */
  const fetchGradeHistory = useCallback(
    async (gradeId: number) => {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const data = await teacherGradeService.getGradeHistory(gradeId, tenantId);
        setHistory(data);

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors du chargement de l\'historique');
        setHistoryError(error);
        throw error;
      } finally {
        setHistoryLoading(false);
      }
    },
    [tenantId]
  );

  /**
   * Request a correction for a published grade
   */
  const requestCorrection = useCallback(
    async (gradeId: number, data: RequestGradeCorrectionPayload) => {
      try {
        setRequesting(true);
        setRequestError(null);
        setRequestResult(null);
        const result = await teacherGradeService.requestGradeCorrection(gradeId, data, tenantId);
        setRequestResult(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de la demande de correction');
        setRequestError(error);
        throw error;
      } finally {
        setRequesting(false);
      }
    },
    [tenantId]
  );

  /**
   * Reset correction request state
   */
  const resetRequest = useCallback(() => {
    setRequestError(null);
    setRequestResult(null);
  }, []);

  /**
   * Reset history state
   */
  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryError(null);
  }, []);

  /**
   * Export module history as Excel
   */
  const exportModuleHistory = useCallback(
    async (moduleId: number, moduleName?: string) => {
      try {
        setExporting(true);
        setExportError(null);
        const blob = await teacherGradeService.exportModuleHistory(moduleId, tenantId);

        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique-notes-${moduleName || moduleId}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de l\'export');
        setExportError(error);
        throw error;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  /**
   * Export evaluation history as Excel
   */
  const exportEvaluationHistory = useCallback(
    async (evaluationId: number, evaluationName?: string) => {
      try {
        setExporting(true);
        setExportError(null);
        const blob = await teacherGradeService.exportEvaluationHistory(evaluationId, tenantId);

        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique-notes-${evaluationName || evaluationId}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de l\'export');
        setExportError(error);
        throw error;
      } finally {
        setExporting(false);
      }
    },
    [tenantId]
  );

  return {
    // History
    history,
    historyLoading,
    historyError,
    fetchGradeHistory,
    resetHistory,

    // Correction request
    requesting,
    requestError,
    requestResult,
    requestCorrection,
    resetRequest,

    // Export
    exporting,
    exportError,
    exportModuleHistory,
    exportEvaluationHistory,
  };
};
