import { createApiClient } from '@/shared/lib/api-client';

/**
 * Response wrapper for API responses
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * File validation response
 */
export interface FileValidationResult {
  valid: boolean;
  missing_columns?: string[];
  detected_columns?: string[];
}

/**
 * Preview row for import
 */
export interface ImportPreviewRow {
  matricule: string;
  nom: string;
  prenom: string;
  note: string | number | null;
}

/**
 * Preview response
 */
export interface ImportPreviewResponse {
  data: ImportPreviewRow[];
  count: number;
}

/**
 * Import report response
 */
export interface ImportReport {
  imported: number;
  updated: number;
  errors: Array<{
    row: any;
    error: string;
  }>;
  total_processed: number;
}

/**
 * Import execute response
 */
export interface ImportExecuteResponse {
  message: string;
  data?: ImportReport;
  async?: boolean;
  estimated_rows?: number;
}

/**
 * Import status response
 */
export interface ImportStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
}

/**
 * Grade Import Service
 * Handles Excel import operations for grades
 * API routes: /frontend/teacher/grades/import/...
 */
class GradeImportService {
  private baseUrl = '/frontend/teacher/grades/import';

  /**
   * Download Excel template for grade import
   */
  async downloadTemplate(
    evaluationId: number,
    includeExisting: boolean = false,
    tenantId?: string
  ): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/template`,
        {
          params: {
            evaluation_id: evaluationId,
            include_existing: includeExisting,
          },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded Excel file structure
   */
  async validateFile(
    file: File,
    tenantId?: string
  ): Promise<FileValidationResult> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<ApiResponse<FileValidationResult>>(
        `${this.baseUrl}/validate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error validating file:', error);
      throw error;
    }
  }

  /**
   * Preview uploaded file data
   */
  async previewFile(
    file: File,
    limit: number = 50,
    tenantId?: string
  ): Promise<ImportPreviewResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('limit', limit.toString());

      const response = await client.post<ImportPreviewResponse>(
        `${this.baseUrl}/preview`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error previewing file:', error);
      throw error;
    }
  }

  /**
   * Execute grade import
   */
  async executeImport(
    file: File,
    evaluationId: number,
    importMode: 'add' | 'update' | 'overwrite',
    async: boolean = true,
    tenantId?: string
  ): Promise<ImportExecuteResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('evaluation_id', evaluationId.toString());
      formData.append('import_mode', importMode);
      formData.append('async', async ? '1' : '0');

      const response = await client.post<ImportExecuteResponse>(
        `${this.baseUrl}/execute`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error executing import:', error);
      throw error;
    }
  }

  /**
   * Check async import status
   */
  async getImportStatus(
    jobId: string,
    tenantId?: string
  ): Promise<ImportStatusResponse> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<ImportStatusResponse>(
        `${this.baseUrl}/status/${jobId}`
      );

      return response.data;
    } catch (error) {
      console.error('Error getting import status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gradeImportService = new GradeImportService();
