/**
 * Admin ECTS Service
 * Handles ECTS credits tracking, allocations, and progression
 * API routes: /api/admin/students/{student}/ects/*, /api/admin/semesters/{semester}/ects/*
 */

import { createApiClient } from '@/shared/lib/api-client';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface EctsAllocationItem {
  id: number;
  student_id: number;
  module_id: number;
  credits_allocated: number;
  allocation_type: 'validated' | 'compensated' | 'equivalence';
  allocation_type_label: string;
  note: string | null;
  allocated_at: string;
  module?: {
    id: number;
    code: string;
    name: string;
    credits_ects: number;
  };
}

export interface EctsStudentSummary {
  total_credits: number;
  semesters: Array<{
    semester_id: number;
    semester_name: string;
    credits_acquired: number;
    validated_count: number;
    compensated_count: number;
  }>;
  equivalences: {
    credits: number;
    modules: Array<{
      module_id: number;
      module_name: string;
      credits: number;
      note: string | null;
    }>;
  };
  progression: Record<string, {
    acquired: number;
    total: number;
    percentage: number;
  }>;
}

export interface EctsProgressionResult {
  can_progress: boolean;
  acquired_credits: number;
  total_credits: number;
  percentage: number;
  required_percentage: number;
  missing_credits: number;
}

export interface EctsSemesterStatistics {
  total_students: number;
  avg_credits_acquired: number;
  avg_success_rate: number;
  distribution: Record<string, number>;
}

class AdminEctsService {
  private baseUrl = '/admin';

  /**
   * Get ECTS summary for a student
   */
  async getStudentSummary(
    studentId: number,
    tenantId?: string
  ): Promise<EctsStudentSummary> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EctsStudentSummary>>(
      `${this.baseUrl}/students/${studentId}/ects/summary`
    );

    return response.data.data;
  }

  /**
   * Get ECTS allocations for a student in a semester
   */
  async getSemesterAllocations(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<EctsAllocationItem[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EctsAllocationItem[]>>(
      `${this.baseUrl}/students/${studentId}/semesters/${semesterId}/ects`
    );

    return response.data.data;
  }

  /**
   * Recalculate ECTS for a student in a semester
   */
  async recalculate(
    studentId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<{ message: string }> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/students/${studentId}/semesters/${semesterId}/ects/recalculate`
    );

    return response.data.data || { message: response.data.message || 'Recalculated' };
  }

  /**
   * Get ECTS statistics for a semester
   */
  async getSemesterStatistics(
    semesterId: number,
    tenantId?: string
  ): Promise<EctsSemesterStatistics> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EctsSemesterStatistics>>(
      `${this.baseUrl}/semesters/${semesterId}/ects/statistics`
    );

    return response.data.data;
  }

  /**
   * Check progression eligibility for a student
   */
  async checkProgression(
    studentId: number,
    level: string,
    tenantId?: string
  ): Promise<EctsProgressionResult> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EctsProgressionResult>>(
      `${this.baseUrl}/students/${studentId}/ects/progression/${level}`
    );

    return response.data.data;
  }

  /**
   * Allocate equivalence credits
   */
  async allocateEquivalence(
    studentId: number,
    moduleId: number,
    credits: number,
    note?: string,
    tenantId?: string
  ): Promise<EctsAllocationItem> {
    const client = createApiClient(tenantId);
    const response = await client.post<ApiResponse<EctsAllocationItem>>(
      `${this.baseUrl}/students/${studentId}/ects/equivalence`,
      { module_id: moduleId, credits, note }
    );

    return response.data.data;
  }

  /**
   * Get equivalences for a student
   */
  async getEquivalences(
    studentId: number,
    tenantId?: string
  ): Promise<EctsAllocationItem[]> {
    const client = createApiClient(tenantId);
    const response = await client.get<ApiResponse<EctsAllocationItem[]>>(
      `${this.baseUrl}/students/${studentId}/ects/equivalences`
    );

    return response.data.data;
  }
}

export const adminEctsService = new AdminEctsService();
