'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { gradeImportService } from '../services/gradeImportService';
import type {
  FileValidationResult,
  ImportPreviewResponse,
  ImportExecuteResponse,
  ImportStatusResponse,
} from '../services/gradeImportService';

/**
 * Hook for grade import operations
 * Handles template download, file validation, preview, and execution
 */
export const useGradeImport = (tenantId?: string) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);

  /**
   * Download template mutation
   */
  const downloadTemplateMutation = useMutation({
    mutationFn: async ({
      evaluationId,
      includeExisting,
    }: {
      evaluationId: number;
      includeExisting?: boolean;
    }) => {
      const blob = await gradeImportService.downloadTemplate(
        evaluationId,
        includeExisting,
        tenantId
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_notes_${evaluationId}_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
  });

  /**
   * Validate file mutation
   */
  const validateFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await gradeImportService.validateFile(file, tenantId);
      setValidationResult(result);
      if (result.valid) {
        setSelectedFile(file);
      }
      return result;
    },
  });

  /**
   * Preview file mutation
   */
  const previewFileMutation = useMutation({
    mutationFn: async ({ file, limit }: { file: File; limit?: number }) => {
      const result = await gradeImportService.previewFile(file, limit, tenantId);
      setPreviewData(result);
      return result;
    },
  });

  /**
   * Execute import mutation
   */
  const executeImportMutation = useMutation({
    mutationFn: async ({
      file,
      evaluationId,
      importMode,
      async,
    }: {
      file: File;
      evaluationId: number;
      importMode: 'add' | 'update' | 'overwrite';
      async?: boolean;
    }) => {
      const result = await gradeImportService.executeImport(
        file,
        evaluationId,
        importMode,
        async,
        tenantId
      );
      return result;
    },
  });

  /**
   * Check import status query (for async imports)
   */
  const useImportStatus = (jobId: string | null, enabled: boolean = false) => {
    return useQuery({
      queryKey: ['gradeImportStatus', jobId, tenantId],
      queryFn: () => gradeImportService.getImportStatus(jobId!, tenantId),
      enabled: enabled && !!jobId,
      refetchInterval: (data) => {
        // Poll every 2 seconds if still pending/processing
        if (data?.status === 'pending' || data?.status === 'processing') {
          return 2000;
        }
        return false;
      },
    });
  };

  /**
   * Reset state
   */
  const reset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setPreviewData(null);
  };

  return {
    // State
    selectedFile,
    validationResult,
    previewData,

    // Mutations
    downloadTemplate: downloadTemplateMutation.mutate,
    isDownloadingTemplate: downloadTemplateMutation.isPending,
    downloadTemplateError: downloadTemplateMutation.error,

    validateFile: validateFileMutation.mutate,
    isValidatingFile: validateFileMutation.isPending,
    validateFileError: validateFileMutation.error,

    previewFile: previewFileMutation.mutate,
    isPreviewingFile: previewFileMutation.isPending,
    previewFileError: previewFileMutation.error,

    executeImport: executeImportMutation.mutate,
    isExecutingImport: executeImportMutation.isPending,
    executeImportError: executeImportMutation.error,
    executeImportResult: executeImportMutation.data,

    // Status query hook
    useImportStatus,

    // Utils
    reset,
  };
};
