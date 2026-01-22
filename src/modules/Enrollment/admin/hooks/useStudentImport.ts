import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentImportService } from '../services/studentImportService';
import { useTenant } from '@/shared/lib/tenant-context';
import type {
  ImportPreviewResponse,
  ImportPreviewRow,
  ImportExecuteRequest,
  ImportExecuteResponse,
  ImportJobStatus,
  ImportColumnMapping,
  ImportMode,
} from '../../types/student.types';

/**
 * Import Wizard Step
 */
export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

/**
 * Parse CSV headers from file content
 * This is a fallback for when the backend doesn't return headers
 */
const parseCSVHeaders = (content: string): string[] => {
  // Detect delimiter (common ones: , ; \t)
  const firstLine = content.split(/\r?\n/)[0] || '';

  // Count potential delimiters
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  // Choose delimiter with most occurrences
  let delimiter = ',';
  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  // Split first line by delimiter and clean up headers
  const headers = firstLine.split(delimiter).map(h => {
    // Remove BOM if present, trim whitespace, remove quotes
    return h.replace(/^\uFEFF/, '').trim().replace(/^["']|["']$/g, '');
  }).filter(h => h.length > 0);

  return headers;
};

/**
 * Read file as text
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Detect CSV delimiter
 */
const detectDelimiter = (content: string): string => {
  const firstLine = content.split(/\r?\n/)[0] || '';
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    return ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    return '\t';
  }
  return ',';
};

/**
 * Parse full CSV content into preview rows
 * This is a fallback for when the backend doesn't return preview data
 */
const parseCSVContent = (content: string): { headers: string[], rows: Array<{ rowNumber: number, data: Record<string, string> }> } => {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const delimiter = detectDelimiter(content);

  // Parse headers (first line)
  const headers = lines[0].split(delimiter).map(h =>
    h.replace(/^\uFEFF/, '').trim().replace(/^["']|["']$/g, '')
  );

  // Parse data rows
  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const data: Record<string, string> = {};

    headers.forEach((header, i) => {
      data[header] = values[i] || '';
    });

    return {
      rowNumber: index + 2, // +2 because row 1 is header, and we're 0-indexed
      data,
    };
  });

  return { headers, rows };
};

/**
 * Generate preview response from locally parsed CSV
 */
const generateLocalPreview = (content: string): Partial<ImportPreviewResponse> => {
  const { headers, rows } = parseCSVContent(content);

  // Create preview rows with basic validation status
  const previewRows: ImportPreviewRow[] = rows.map(row => ({
    rowNumber: row.rowNumber,
    data: row.data,
    status: 'valid' as const,
    errors: [],
    warnings: [],
    isDuplicate: false,
  }));

  return {
    total_rows: rows.length,
    valid_rows: rows.length,
    error_rows: 0,
    warning_rows: 0,
    duplicate_rows: 0,
    preview: previewRows,
    detected_encoding: 'UTF-8',
    column_headers: headers,
  };
};

/**
 * Hook for managing the full import workflow
 */
export const useStudentImport = () => {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();

  // State
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<ImportColumnMapping[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('complete');
  const [generateMatricules, setGenerateMatricules] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [result, setResult] = useState<ImportExecuteResponse | null>(null);
  const [jobStatus, setJobStatus] = useState<ImportJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling ref for job status
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to hold file content for fallback parsing
  const fileContentRef = useRef<string | null>(null);

  // Upload and preview mutation
  const uploadMutation = useMutation<ImportPreviewResponse, Error, File>({
    mutationFn: (file) => studentImportService.uploadAndPreview(file, tenantId || undefined),
    onSuccess: (data) => {
      console.log('Full backend response:', JSON.stringify(data, null, 2));

      // Check if backend returned valid preview data
      const hasValidPreviewData = data.preview && Array.isArray(data.preview) && data.preview.length > 0;
      const hasValidStats = typeof data.total_rows === 'number' && data.total_rows > 0;

      // If backend didn't return valid preview data, generate it locally
      let finalPreviewData = data;
      if ((!hasValidPreviewData || !hasValidStats) && fileContentRef.current) {
        console.log('Backend did not return valid preview data, generating locally...');
        const localPreview = generateLocalPreview(fileContentRef.current);
        finalPreviewData = {
          ...data,
          ...localPreview,
          // Keep backend data if it exists
          total_rows: hasValidStats ? data.total_rows : localPreview.total_rows,
          valid_rows: hasValidStats ? data.valid_rows : localPreview.valid_rows,
          error_rows: hasValidStats ? data.error_rows : localPreview.error_rows,
          warning_rows: hasValidStats ? data.warning_rows : localPreview.warning_rows,
          duplicate_rows: data.duplicate_rows ?? localPreview.duplicate_rows,
          preview: hasValidPreviewData ? data.preview : localPreview.preview,
          column_headers: data.column_headers?.length ? data.column_headers : localPreview.column_headers,
        } as ImportPreviewResponse;
        console.log('Generated local preview:', finalPreviewData);
      }

      setPreview(finalPreviewData);

      // Use suggested_mapping from backend, or generate locally from headers
      let mapping = finalPreviewData.suggested_mapping;

      if (!mapping || !Array.isArray(mapping) || mapping.length === 0) {
        // Fallback 1: try column_headers from response
        let headers = finalPreviewData.column_headers || [];

        // Fallback 2: try to extract headers from first preview row's data keys
        if (headers.length === 0 && finalPreviewData.preview && Array.isArray(finalPreviewData.preview) && finalPreviewData.preview.length > 0) {
          const firstRow = finalPreviewData.preview[0];
          if (firstRow && firstRow.data && typeof firstRow.data === 'object') {
            headers = Object.keys(firstRow.data);
          }
        }

        // Fallback 3: check if preview data is at a different path (some backends return it differently)
        if (headers.length === 0 && (finalPreviewData as any).rows && Array.isArray((finalPreviewData as any).rows) && (finalPreviewData as any).rows.length > 0) {
          const firstRow = (finalPreviewData as any).rows[0];
          if (firstRow && typeof firstRow === 'object') {
            headers = Object.keys(firstRow);
          }
        }

        // Fallback 4: if backend returns headers at a different key
        if (headers.length === 0 && (finalPreviewData as any).headers && Array.isArray((finalPreviewData as any).headers)) {
          headers = (finalPreviewData as any).headers;
        }

        // Fallback 5: Parse CSV file directly if we have the content stored
        if (headers.length === 0 && fileContentRef.current) {
          console.log('Attempting to parse CSV headers directly from file content...');
          headers = parseCSVHeaders(fileContentRef.current);
          console.log('Headers parsed from file:', headers);
        }

        if (headers.length > 0) {
          mapping = studentImportService.getSuggestedMapping(headers);
        } else {
          console.warn('Could not extract column headers from backend response. Response structure:', {
            hasPreview: !!finalPreviewData.preview,
            previewIsArray: Array.isArray(finalPreviewData.preview),
            previewLength: Array.isArray(finalPreviewData.preview) ? finalPreviewData.preview.length : 0,
            firstPreviewRow: finalPreviewData.preview?.[0],
            responseKeys: Object.keys(finalPreviewData),
            hasFileContent: !!fileContentRef.current,
          });
          mapping = [];
        }
      }

      console.log('Import preview data:', {
        column_headers: finalPreviewData.column_headers,
        suggested_mapping: finalPreviewData.suggested_mapping,
        extractedHeaders: mapping.map(m => m.csvColumn),
        generatedMapping: mapping
      });

      setColumnMapping(mapping);
      setStep('mapping');
      setError(null);
    },
    onError: (error) => {
      setError(error.message || 'Erreur lors du chargement du fichier');
    },
  });

  // Execute import mutation
  // Request format: { rows: [...], programme_id?: number }
  const executeMutation = useMutation<ImportExecuteResponse, Error, { rows: any[]; programme_id?: number }>({
    mutationFn: (request) => studentImportService.executeImport(request, tenantId || undefined),
    onSuccess: (data) => {
      setResult(data);
      if (data.is_async && data.job_id) {
        setStep('importing');
        startPolling(data.job_id);
      } else {
        setStep('complete');
        queryClient.invalidateQueries({ queryKey: ['students'] });
      }
      setError(null);
    },
    onError: (error) => {
      setError(error.message || "Erreur lors de l'import");
    },
  });

  // Start polling for job status
  const startPolling = useCallback((jobId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const poll = async () => {
      try {
        const status = await studentImportService.getJobStatus(jobId, tenantId || undefined);
        setJobStatus(status);

        if (status.status === 'completed' || status.status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setStep('complete');
          queryClient.invalidateQueries({ queryKey: ['students'] });
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    };

    // Poll immediately and then every 2 seconds
    poll();
    pollingRef.current = setInterval(poll, 2000);
  }, [tenantId, queryClient]);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Upload file handler
  const uploadFile = useCallback(async (file: File) => {
    setFile(file);

    // Read file content for fallback parsing (in case backend doesn't return headers)
    try {
      const content = await readFileAsText(file);
      fileContentRef.current = content;
      console.log('File content read successfully, first 200 chars:', content.substring(0, 200));
    } catch (err) {
      console.warn('Could not read file content for fallback parsing:', err);
      fileContentRef.current = null;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation]);

  // Update column mapping
  const updateColumnMapping = useCallback((mapping: ImportColumnMapping[]) => {
    setColumnMapping(mapping);
  }, []);

  // Validate and proceed to preview
  const proceedToPreview = useCallback(() => {
    const validation = studentImportService.validateMapping(columnMapping);
    if (!validation.isValid) {
      setError(`Champs obligatoires manquants: ${validation.missingRequired.join(', ')}`);
      return false;
    }
    setStep('preview');
    setError(null);
    return true;
  }, [columnMapping]);

  // Execute import
  const executeImport = useCallback(() => {
    if (!preview || !preview.preview) return;

    // Transform preview rows to backend expected format
    // Backend expects: { rows: [...], programme_id?: number }
    // Each row should have: row_number, nom, prenom, email, date_naissance, sexe, is_valid, etc.
    const rows = preview.preview.map(row => {
      // Map frontend field names to backend expected French field names using columnMapping
      const mappedData: Record<string, any> = {
        row_number: row.rowNumber,
        is_valid: row.status === 'valid',
        errors: row.errors?.map(e => e.message) || [],
      };

      // Map each column based on columnMapping
      columnMapping.forEach(mapping => {
        if (mapping.fieldName && row.data[mapping.csvColumn] !== undefined) {
          // Convert frontend field names to backend French field names
          const backendFieldMap: Record<string, string> = {
            'firstname': 'prenom',
            'lastname': 'nom',
            'birthdate': 'date_naissance',
            'sex': 'sexe',
            'email': 'email',
            'phone': 'telephone',
            'mobile': 'mobile',
            'address': 'adresse',
            'city': 'ville',
            'country': 'pays',
            'nationality': 'nationalite',
            'birthplace': 'lieu_naissance',
            'programme_code': 'programme',
          };
          const backendField = backendFieldMap[mapping.fieldName] || mapping.fieldName;
          mappedData[backendField] = row.data[mapping.csvColumn];
        }
      });

      // If no mapping was applied, use the raw data with original French headers
      if (Object.keys(mappedData).length <= 3) {
        // Use raw data directly (already in French format from CSV)
        Object.assign(mappedData, row.data);
      }

      return mappedData;
    });

    const request: { rows: any[]; programme_id?: number } = {
      rows,
      // programme_id can be added if needed
    };

    console.log('Sending import request:', request);
    executeMutation.mutate(request);
  }, [preview, columnMapping, executeMutation]);

  // Cancel import
  const cancelImport = useCallback(async () => {
    if (jobStatus?.job_id) {
      try {
        await studentImportService.cancelImport(jobStatus.job_id, tenantId || undefined);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        reset();
      } catch (err) {
        console.error('Error cancelling import:', err);
      }
    }
  }, [jobStatus, tenantId]);

  // Download template
  const downloadTemplate = useCallback(async () => {
    try {
      const blob = await studentImportService.downloadTemplate(tenantId || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-import-etudiants.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du template');
    }
  }, [tenantId]);

  // Download report
  const downloadReport = useCallback(async () => {
    const jobId = result?.job_id || jobStatus?.job_id;
    if (!jobId) return;

    try {
      const blob = await studentImportService.downloadReport(jobId, tenantId || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-import-${jobId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du rapport');
    }
  }, [result, jobStatus, tenantId]);

  // Reset state
  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    fileContentRef.current = null;
    setPreview(null);
    setColumnMapping([]);
    setImportMode('complete');
    setGenerateMatricules(true);
    setSkipDuplicates(true);
    setResult(null);
    setJobStatus(null);
    setError(null);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Go back to previous step
  const goBack = useCallback(() => {
    switch (step) {
      case 'mapping':
        setStep('upload');
        break;
      case 'preview':
        setStep('mapping');
        break;
      default:
        break;
    }
  }, [step]);

  return {
    // State
    step,
    file,
    preview,
    columnMapping,
    importMode,
    generateMatricules,
    skipDuplicates,
    result,
    jobStatus,
    error,
    isUploading: uploadMutation.isPending,
    isExecuting: executeMutation.isPending,

    // Actions
    uploadFile,
    updateColumnMapping,
    setImportMode,
    setGenerateMatricules,
    setSkipDuplicates,
    proceedToPreview,
    executeImport,
    cancelImport,
    downloadTemplate,
    downloadReport,
    reset,
    goBack,
    clearError: () => setError(null),
  };
};

/**
 * Hook for downloading import template
 */
export const useImportTemplate = () => {
  const { tenantId } = useTenant();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const blob = await studentImportService.downloadTemplate(tenantId || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-import-etudiants.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du template');
    } finally {
      setIsDownloading(false);
    }
  }, [tenantId]);

  return {
    downloadTemplate,
    isDownloading,
    error,
  };
};
