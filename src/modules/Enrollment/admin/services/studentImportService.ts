import { createApiClient } from '@/shared/lib/api-client';
import type {
  ImportPreviewResponse,
  ImportExecuteRequest,
  ImportExecuteResponse,
  ImportJobStatus,
  ImportTemplateInfo,
  ImportColumnMapping,
  ImportMode,
} from '../../types/student.types';

/**
 * Student Import Service
 * Handles all API communication related to bulk student import
 */
class StudentImportService {
  private baseUrl = '/admin/enrollment/students';

  /**
   * Upload file and get preview with validation
   */
  async uploadAndPreview(
    file: File,
    tenantId?: string
  ): Promise<ImportPreviewResponse> {
    try {
      const client = createApiClient(tenantId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<{ data: ImportPreviewResponse }>(
        `${this.baseUrl}/import/preview`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Log raw response for debugging
      console.log('Raw API response:', {
        status: response.status,
        fullData: response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        innerData: response.data?.data,
        innerDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
      });

      // Handle both wrapped { data: ... } and unwrapped responses
      const result = response.data?.data || response.data;
      return result as ImportPreviewResponse;
    } catch (error) {
      console.error('Error uploading file for preview:', error);
      throw error;
    }
  }

  /**
   * Execute/Confirm the import
   * Backend route: POST /import/confirm
   * Backend expects: { rows: [...], programme_id?: number }
   * Backend returns: { imported_count, imported_students, errors }
   * Note: Backend returns 422 when no students are imported, but we still want to show the results
   */
  async executeImport(
    request: { rows: any[]; programme_id?: number },
    tenantId?: string
  ): Promise<ImportExecuteResponse> {
    const client = createApiClient(tenantId);

    try {
      const response = await client.post<{
        message: string;
        data: {
          imported_count: number;
          imported_students: any[];
          errors: any[];
        };
      }>(`${this.baseUrl}/import/confirm`, request);

      return this.transformImportResponse(response.data, request.rows.length);
    } catch (error: any) {
      console.error('Error executing import:', error);

      // Check if this is a 422 response with import results (partial failure)
      if (error.response?.status === 422 && error.response?.data?.data) {
        // This is not really an error - backend returns 422 when no students imported
        // but we still have useful data to display
        return this.transformImportResponse(error.response.data, request.rows.length);
      }

      throw error;
    }
  }

  /**
   * Transform backend import response to frontend format
   */
  private transformImportResponse(
    responseData: { message: string; data: { imported_count: number; imported_students: any[]; errors: any[] } },
    totalRows: number
  ): ImportExecuteResponse {
    const backendData = responseData.data;

    // Build results array combining imported students and errors
    const results: any[] = [];

    // Add imported students
    backendData.imported_students?.forEach((student: any) => {
      results.push({
        row_number: student.row_number || results.length + 1,
        status: 'created' as const,
        matricule: student.matricule,
        student_name: `${student.firstname || student.prenom} ${student.lastname || student.nom}`,
      });
    });

    // Add errors
    backendData.errors?.forEach((err: any) => {
      results.push({
        row_number: err.row_number || err.row || 0,
        status: 'error' as const,
        error: err.error || err.message || 'Erreur inconnue',
      });
    });

    // Sort by row number
    results.sort((a, b) => a.row_number - b.row_number);

    return {
      is_async: false,
      total: totalRows,
      created: backendData.imported_count,
      updated: 0,
      skipped: totalRows - backendData.imported_count - (backendData.errors?.length || 0),
      errors: backendData.errors?.length || 0,
      results,
      // Keep raw errors for detailed display
      errorDetails: backendData.errors || [],
    };
  }

  /**
   * Get import job status (for async imports)
   */
  async getJobStatus(jobId: string, tenantId?: string): Promise<ImportJobStatus> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: ImportJobStatus }>(
        `${this.baseUrl}/import/status/${jobId}`
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching job status for ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Download import template
   */
  async downloadTemplate(tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(`${this.baseUrl}/import/template`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Get template information (columns description)
   */
  async getTemplateInfo(tenantId?: string): Promise<ImportTemplateInfo> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get<{ data: ImportTemplateInfo }>(
        `${this.baseUrl}/import/template-info`
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching template info:', error);
      throw error;
    }
  }

  /**
   * Download import report (after import completion)
   */
  async downloadReport(jobId: string, tenantId?: string): Promise<Blob> {
    try {
      const client = createApiClient(tenantId);
      const response = await client.get(
        `${this.baseUrl}/import/report/${jobId}`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Error downloading report for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an ongoing import job
   */
  async cancelImport(jobId: string, tenantId?: string): Promise<void> {
    try {
      const client = createApiClient(tenantId);
      await client.post(`${this.baseUrl}/import/cancel/${jobId}`);
    } catch (error) {
      console.error(`Error cancelling import job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Validate column mapping
   */
  validateMapping(mapping: ImportColumnMapping[]): {
    isValid: boolean;
    missingRequired: string[];
  } {
    const requiredFields = [
      'firstname',
      'lastname',
      'birthdate',
      'sex',
      'email',
      'mobile',
      'programme_code',
    ];

    // Guard: if mapping is undefined or empty, all required fields are missing
    if (!mapping || !Array.isArray(mapping) || mapping.length === 0) {
      return {
        isValid: false,
        missingRequired: requiredFields,
      };
    }

    const mappedFields = mapping
      .filter((m) => m?.fieldName !== null && m?.fieldName !== undefined)
      .map((m) => m.fieldName);

    const missingRequired = requiredFields.filter(
      (field) => !mappedFields.includes(field as any)
    );

    return {
      isValid: missingRequired.length === 0,
      missingRequired,
    };
  }

  /**
   * Get default column mapping suggestions based on CSV headers
   */
  getSuggestedMapping(headers: string[]): ImportColumnMapping[] {
    const fieldMappings: Record<string, keyof import('../../types/student.types').StudentFormData | 'programme_code'> = {
      // French headers
      'prenom': 'firstname',
      'prénom': 'firstname',
      'nom': 'lastname',
      'date_naissance': 'birthdate',
      'date de naissance': 'birthdate',
      'sexe': 'sex',
      'genre': 'sex',
      'email': 'email',
      'courriel': 'email',
      'mobile': 'mobile',
      'telephone': 'phone',
      'téléphone': 'phone',
      'adresse': 'address',
      'ville': 'city',
      'pays': 'country',
      'nationalite': 'nationality',
      'nationalité': 'nationality',
      'lieu_naissance': 'birthplace',
      'lieu de naissance': 'birthplace',
      'programme': 'programme_code',
      'code_programme': 'programme_code',
      'contact_urgence_nom': 'emergency_contact_name',
      'contact_urgence_tel': 'emergency_contact_phone',

      // English headers
      'firstname': 'firstname',
      'first_name': 'firstname',
      'lastname': 'lastname',
      'last_name': 'lastname',
      'birthdate': 'birthdate',
      'birth_date': 'birthdate',
      'date_of_birth': 'birthdate',
      'sex': 'sex',
      'gender': 'sex',
      'phone': 'phone',
      'address': 'address',
      'city': 'city',
      'country': 'country',
      'nationality': 'nationality',
      'birthplace': 'birthplace',
      'birth_place': 'birthplace',
      'programme_code': 'programme_code',
      'program_code': 'programme_code',
      'emergency_contact_name': 'emergency_contact_name',
      'emergency_contact_phone': 'emergency_contact_phone',
    };

    const requiredFields = ['firstname', 'lastname', 'birthdate', 'sex', 'email', 'mobile', 'programme_code'];

    return headers.map((header) => {
      const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '_');
      const fieldName = fieldMappings[normalizedHeader] || null;

      return {
        csvColumn: header,
        fieldName,
        required: fieldName ? requiredFields.includes(fieldName) : false,
      };
    });
  }
}

// Export singleton instance
export const studentImportService = new StudentImportService();
