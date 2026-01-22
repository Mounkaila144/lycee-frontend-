import { createApiClient } from '@/shared/lib/api-client'
import type {
  AcademicYear,
  AcademicYearFormInput,
  Semester,
  SemesterFormInput,
  AcademicPeriod,
  AcademicPeriodFormInput,
  EvaluationPeriod,
  EvaluationPeriodFormInput,
  CloseSemesterResponse
} from '../../types/academicCalendar.types'

class AcademicCalendarService {
  // ==================== Academic Years ====================

  /**
   * Get all academic years
   */
  async getAcademicYears(tenantId?: string): Promise<AcademicYear[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: AcademicYear[] }>('/admin/academic-years')
    return response.data.data
  }

  /**
   * Get a single academic year
   */
  async getAcademicYear(id: number, tenantId?: string): Promise<AcademicYear> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: AcademicYear }>(`/admin/academic-years/${id}`)
    return response.data.data
  }

  /**
   * Create a new academic year
   */
  async createAcademicYear(data: AcademicYearFormInput, tenantId?: string): Promise<AcademicYear> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: AcademicYear }>('/admin/academic-years', data)
    return response.data.data
  }

  /**
   * Update an academic year
   */
  async updateAcademicYear(
    id: number,
    data: Partial<AcademicYearFormInput>,
    tenantId?: string
  ): Promise<AcademicYear> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: AcademicYear }>(`/admin/academic-years/${id}`, data)
    return response.data.data
  }

  /**
   * Delete an academic year
   */
  async deleteAcademicYear(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/academic-years/${id}`)
  }

  /**
   * Activate an academic year (deactivates others)
   */
  async activateAcademicYear(id: number, tenantId?: string): Promise<AcademicYear> {
    const client = createApiClient(tenantId)
    const response = await client.patch<{ data: AcademicYear }>(`/admin/academic-years/${id}/activate`)
    return response.data.data
  }

  // ==================== Semesters ====================

  /**
   * Get all semesters
   */
  async getSemesters(params?: { academic_year_id?: number }, tenantId?: string): Promise<Semester[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Semester[] }>('/admin/semesters', { params })
    return response.data.data
  }

  /**
   * Get a single semester
   */
  async getSemester(id: number, tenantId?: string): Promise<Semester> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Semester }>(`/admin/semesters/${id}`)
    return response.data.data
  }

  /**
   * Create a new semester
   */
  async createSemester(data: SemesterFormInput, tenantId?: string): Promise<Semester> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: Semester }>('/admin/semesters', data)
    return response.data.data
  }

  /**
   * Update a semester
   */
  async updateSemester(id: number, data: Partial<SemesterFormInput>, tenantId?: string): Promise<Semester> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Semester }>(`/admin/semesters/${id}`, data)
    return response.data.data
  }

  /**
   * Delete a semester
   */
  async deleteSemester(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/semesters/${id}`)
  }

  /**
   * Close a semester (locks grade entry)
   */
  async closeSemester(id: number, tenantId?: string): Promise<CloseSemesterResponse> {
    const client = createApiClient(tenantId)
    const response = await client.post<CloseSemesterResponse>(`/admin/semesters/${id}/close`)
    return response.data
  }

  // ==================== Academic Periods ====================

  /**
   * Get all academic periods
   */
  async getAcademicPeriods(params?: { semester_id?: number }, tenantId?: string): Promise<AcademicPeriod[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: AcademicPeriod[] }>('/admin/academic-periods', { params })
    return response.data.data
  }

  /**
   * Create a new academic period
   */
  async createAcademicPeriod(data: AcademicPeriodFormInput, tenantId?: string): Promise<AcademicPeriod> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: AcademicPeriod }>('/admin/academic-periods', data)
    return response.data.data
  }

  /**
   * Update an academic period
   */
  async updateAcademicPeriod(
    id: number,
    data: Partial<AcademicPeriodFormInput>,
    tenantId?: string
  ): Promise<AcademicPeriod> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: AcademicPeriod }>(`/admin/academic-periods/${id}`, data)
    return response.data.data
  }

  /**
   * Delete an academic period
   */
  async deleteAcademicPeriod(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/academic-periods/${id}`)
  }

  // ==================== Evaluation Periods ====================

  /**
   * Get evaluation periods for a semester
   */
  async getEvaluationPeriods(semesterId: number, tenantId?: string): Promise<EvaluationPeriod[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: EvaluationPeriod[] }>(
      `/admin/semesters/${semesterId}/evaluation-periods`
    )
    return response.data.data
  }

  /**
   * Create a new evaluation period
   */
  async createEvaluationPeriod(
    semesterId: number,
    data: Omit<EvaluationPeriodFormInput, 'semester_id'>,
    tenantId?: string
  ): Promise<EvaluationPeriod> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: EvaluationPeriod }>(
      `/admin/semesters/${semesterId}/evaluation-periods`,
      data
    )
    return response.data.data
  }

  /**
   * Update an evaluation period
   */
  async updateEvaluationPeriod(
    semesterId: number,
    id: number,
    data: Partial<Omit<EvaluationPeriodFormInput, 'semester_id'>>,
    tenantId?: string
  ): Promise<EvaluationPeriod> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: EvaluationPeriod }>(
      `/admin/semesters/${semesterId}/evaluation-periods/${id}`,
      data
    )
    return response.data.data
  }

  /**
   * Delete an evaluation period
   */
  async deleteEvaluationPeriod(semesterId: number, id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/semesters/${semesterId}/evaluation-periods/${id}`)
  }
}

export const academicCalendarService = new AcademicCalendarService()
