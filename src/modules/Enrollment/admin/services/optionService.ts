import { createApiClient } from '@/shared/lib/api-client';
import type {
  Option,
  OptionChoice,
  OptionAssignment,
  OptionFormData,
  OptionQueryParams,
  PaginatedOptionsResponse,
  AvailableOptionsResponse,
  SubmitChoicesRequest,
  GlobalOptionStatistics,
  OptionStatistics,
  AssignmentResult,
  ManualAssignmentRequest,
  AutomaticAssignmentRequest,
  StudentOptionSummary,
} from '../../types/option.types';

/**
 * Single Option Response
 */
interface OptionResponse {
  data: Option;
  message?: string;
}

/**
 * Option Service
 * Handles all API communication for option management and selection
 *
 * Backend routes: Modules/Enrollment/Routes/admin.php
 * Base path: /api/admin/enrollment/options
 */
class OptionService {
  private baseUrl = '/admin/enrollment/options';

  // ============================================
  // Admin API Methods
  // ============================================

  /**
   * Get paginated list of options
   * Route: GET /api/admin/enrollment/options
   */
  async getOptions(
    params: OptionQueryParams = {},
    tenantId?: string
  ): Promise<PaginatedOptionsResponse> {
    const client = createApiClient(tenantId);
    const response = await client.get<PaginatedOptionsResponse>(this.baseUrl, { params });

    return response.data;
  }

  /**
   * Get single option by ID
   * Route: GET /api/admin/enrollment/options/{id}
   */
  async getOptionById(id: number, tenantId?: string): Promise<Option> {
    const client = createApiClient(tenantId);
    const response = await client.get<OptionResponse>(`${this.baseUrl}/${id}`);

    return response.data.data;
  }

  /**
   * Create new option
   * Route: POST /api/admin/enrollment/options
   */
  async createOption(data: OptionFormData, tenantId?: string): Promise<Option> {
    const client = createApiClient(tenantId);
    const response = await client.post<OptionResponse>(this.baseUrl, data);

    return response.data.data;
  }

  /**
   * Update option
   * Route: PUT /api/admin/enrollment/options/{id}
   */
  async updateOption(
    id: number,
    data: Partial<OptionFormData>,
    tenantId?: string
  ): Promise<Option> {
    const client = createApiClient(tenantId);
    const response = await client.put<OptionResponse>(`${this.baseUrl}/${id}`, data);

    return response.data.data;
  }

  /**
   * Delete option
   * Route: DELETE /api/admin/enrollment/options/{id}
   */
  async deleteOption(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get option statistics
   * Route: GET /api/admin/enrollment/options/{id}/statistics
   */
  async getOptionStatistics(
    optionId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<OptionStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: OptionStatistics }>(
      `${this.baseUrl}/${optionId}/statistics`,
      { params: { academic_year_id: academicYearId } }
    );

    return response.data.data;
  }

  /**
   * Get global statistics
   * Route: GET /api/admin/enrollment/options/statistics/global
   */
  async getGlobalStatistics(
    academicYearId: number,
    programId?: number,
    level?: string,
    tenantId?: string
  ): Promise<GlobalOptionStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: GlobalOptionStatistics }>(
      `${this.baseUrl}/statistics/global`,
      {
        params: {
          academic_year_id: academicYearId,
          programme_id: programId,
          level: level,
        },
      }
    );

    return response.data.data;
  }

  /**
   * Run automatic assignment
   * Route: POST /api/admin/enrollment/options/assign
   */
  async runAutomaticAssignment(
    request: AutomaticAssignmentRequest,
    tenantId?: string
  ): Promise<AssignmentResult> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: AssignmentResult }>(
      `${this.baseUrl}/assign`,
      request
    );

    return response.data.data;
  }

  /**
   * Manual assignment
   * Route: POST /api/admin/enrollment/options/assign-manual
   */
  async assignManually(
    request: ManualAssignmentRequest,
    tenantId?: string
  ): Promise<OptionAssignment> {
    const client = createApiClient(tenantId);
    const response = await client.post<{ data: OptionAssignment }>(
      `${this.baseUrl}/assign-manual`,
      request
    );

    return response.data.data;
  }

  /**
   * Get option choices
   * Route: GET /api/admin/enrollment/options/{id}/choices
   */
  async getOptionChoices(
    optionId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<OptionChoice[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: OptionChoice[] }>(
      `${this.baseUrl}/${optionId}/choices`,
      { params: { academic_year_id: academicYearId } }
    );

    return response.data.data;
  }

  /**
   * Get option assignments
   * Route: GET /api/admin/enrollment/options/{id}/assignments
   */
  async getOptionAssignments(
    optionId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<OptionAssignment[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<{ data: OptionAssignment[] }>(
      `${this.baseUrl}/${optionId}/assignments`,
      { params: { academic_year_id: academicYearId } }
    );

    return response.data.data;
  }

  /**
   * Export students by option
   */
  async exportStudentsByOption(
    optionId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<Blob> {
    const client = createApiClient(tenantId);
    const response = await client.get(
      `${this.baseUrl}/${optionId}/assignments`,
      {
        params: {
          academic_year_id: academicYearId,
          format: 'excel'
        },
        responseType: 'blob',
      }
    );

    return response.data;
  }

  // ============================================
  // Student Choice Methods (using admin routes)
  // ============================================

  /**
   * Check if a date range includes today
   */
  private isDateRangeOpen(startDate: string | null | undefined, endDate: string | null | undefined): boolean {
    if (!startDate || !endDate) return true; // If no dates, assume open

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return now >= start && now <= end;
  }

  /**
   * Calculate days remaining until end date
   */
  private getDaysRemaining(endDate: string | null | undefined): number | undefined {
    if (!endDate) return undefined;

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Get available options for student
   * Route: GET /api/admin/enrollment/options (filtered by student's program/level)
   */
  async getAvailableOptions(
    studentId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<AvailableOptionsResponse> {
    const client = createApiClient(tenantId);

    // Get options and student choices in parallel
    const [optionsResponse, choicesResponse] = await Promise.all([
      client.get<{ data: Option[] }>(this.baseUrl, {
        params: {
          academic_year_id: academicYearId,
          status: 'Open'
        }
      }),
      client.get<{ data: { choices: OptionChoice[]; assignment: OptionAssignment | null } }>(`${this.baseUrl}/student-choices`, {
        params: {
          student_id: studentId,
          academic_year_id: academicYearId
        }
      }).catch(() => ({ data: { data: { choices: [], assignment: null } } })) // Return empty if no choices
    ]);

    const options = optionsResponse.data.data || [];
    const choicesData = choicesResponse.data.data || { choices: [], assignment: null };

    // Extract choices array and assignment from nested response
    const choices = Array.isArray(choicesData) ? choicesData : (choicesData.choices || []);
    const assignment = Array.isArray(choicesData) ? null : (choicesData.assignment || null);

    // Map options with computed is_open based on dates
    // Backend returns 'is_choice_period_open', map it to 'is_open' for frontend
    const mappedOptions = options.map(opt => {
      const isDateOpen = this.isDateRangeOpen(opt.choice_start_date, opt.choice_end_date);
      const isStatusOpen = opt.status === 'Open';

      // Use backend's is_choice_period_open if available, otherwise compute from dates
      const backendIsOpen = (opt as any).is_choice_period_open;
      const computedIsOpen = backendIsOpen ?? opt.is_open ?? (isStatusOpen && isDateOpen);

      return {
        ...opt,
        remaining_capacity: opt.remaining_capacity ?? (opt.capacity - (opt.enrolled_count || 0)),
        is_open: computedIsOpen,
        is_full: opt.is_full ?? (opt.remaining_capacity !== undefined ? opt.remaining_capacity <= 0 : false),
        can_choose: computedIsOpen && !opt.is_full,
      };
    });

    // Compute choice period from first option (assuming all share same period)
    const firstOption = options[0];
    const firstOptionBackendIsOpen = firstOption ? (firstOption as any).is_choice_period_open : undefined;
    const choicePeriodIsOpen = firstOption
      ? (firstOptionBackendIsOpen ?? (this.isDateRangeOpen(firstOption.choice_start_date, firstOption.choice_end_date) && firstOption.status === 'Open'))
      : false;

    return {
      options: mappedOptions,
      student_choices: choices,
      student_assignment: assignment,
      choice_period: firstOption ? {
        start_date: firstOption.choice_start_date,
        end_date: firstOption.choice_end_date,
        is_open: choicePeriodIsOpen,
        days_remaining: this.getDaysRemaining(firstOption.choice_end_date),
      } : undefined
    };
  }

  /**
   * Submit student choices
   * Route: POST /api/admin/enrollment/options/choices
   */
  async submitChoices(
    request: SubmitChoicesRequest,
    tenantId?: string
  ): Promise<OptionChoice[]> {
    const client = createApiClient(tenantId);

    // Submit each choice separately
    const results: OptionChoice[] = [];

    for (const choice of request.choices) {
      const response = await client.post<{ data: OptionChoice }>(
        `${this.baseUrl}/choices`,
        {
          student_id: request.student_id,
          academic_year_id: request.academic_year_id,
          option_id: choice.option_id,
          choice_rank: choice.choice_rank,
          motivation: choice.motivation,
        }
      );

      results.push(response.data.data);
    }

    return results;
  }

  /**
   * Get student's current choices
   * Route: GET /api/admin/enrollment/options/student-choices
   */
  async getMyChoices(
    studentId: number,
    academicYearId: number,
    tenantId?: string
  ): Promise<{
    choices: OptionChoice[];
    assignment: OptionAssignment | null;
  }> {
    const client = createApiClient(tenantId);
    const response = await client.get<{
      data: OptionChoice[];
    }>(`${this.baseUrl}/student-choices`, {
      params: {
        student_id: studentId,
        academic_year_id: academicYearId,
      },
    });

    // Check for assignment - would need additional endpoint or embedded in choices
    return {
      choices: response.data.data || [],
      assignment: null, // Would need to be fetched separately
    };
  }

  /**
   * Check prerequisites for an option
   * Route: POST /api/admin/enrollment/options/check-prerequisites
   */
  async checkPrerequisites(
    studentId: number,
    optionId: number,
    tenantId?: string
  ): Promise<{
    can_choose: boolean;
    prerequisites: Array<{
      module_code: string;
      module_name: string;
      required_grade: number;
      student_grade: number | null;
      is_met: boolean;
    }>;
    message?: string;
  }> {
    const client = createApiClient(tenantId);
    const response = await client.post<{
      data: {
        can_choose: boolean;
        prerequisites: Array<{
          module_code: string;
          module_name: string;
          required_grade: number;
          student_grade: number | null;
          is_met: boolean;
        }>;
        message?: string;
      };
    }>(`${this.baseUrl}/check-prerequisites`, {
      student_id: studentId,
      option_id: optionId,
    });

    return response.data.data;
  }

  /**
   * Remove an option assignment
   * Route: DELETE /api/admin/enrollment/option-assignments/{id}
   */
  async removeAssignment(assignmentId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId);
    await client.delete(`/admin/enrollment/option-assignments/${assignmentId}`);
  }
}

// Export singleton instance
export const optionService = new OptionService();
