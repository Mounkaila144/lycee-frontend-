import { createApiClient } from '@/shared/lib/api-client'
import type {
  Specialization,
  SpecializationFormInput,
  StudentSpecialization,
  SpecializationApplication,
  AssignmentCriteria,
  AssignmentResult
} from '../../types/specialization.types'

class SpecializationService {
  /**
   * Get all specializations
   */
  async getAll(tenantId?: string): Promise<Specialization[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Specialization[] }>('/admin/specializations')
    return response.data.data
  }

  /**
   * Get specialization by ID
   */
  async getById(id: number, tenantId?: string): Promise<Specialization> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Specialization }>(`/admin/specializations/${id}`)
    return response.data.data
  }

  /**
   * Create new specialization
   */
  async create(data: SpecializationFormInput, tenantId?: string): Promise<Specialization> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: Specialization }>('/admin/specializations', data)
    return response.data.data
  }

  /**
   * Update specialization
   */
  async update(id: number, data: SpecializationFormInput, tenantId?: string): Promise<Specialization> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Specialization }>(`/admin/specializations/${id}`, data)
    return response.data.data
  }

  /**
   * Delete specialization
   */
  async delete(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/specializations/${id}`)
  }

  /**
   * Get candidates for a specialization
   */
  async getCandidates(id: number, tenantId?: string): Promise<StudentSpecialization[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: StudentSpecialization[] }>(`/admin/specializations/${id}/candidates`)
    return response.data.data
  }

  /**
   * Apply for a specialization (student)
   */
  async apply(id: number, data: SpecializationApplication, tenantId?: string): Promise<StudentSpecialization> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: StudentSpecialization }>(`/admin/specializations/${id}/apply`, data)
    return response.data.data
  }

  /**
   * Cancel application
   */
  async cancelApplication(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/specializations/${id}/cancel-application`)
  }

  /**
   * Assign students to specialization (batch)
   */
  async assignStudents(
    id: number,
    studentIds: number[],
    criteria?: AssignmentCriteria,
    tenantId?: string
  ): Promise<AssignmentResult> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: AssignmentResult }>(`/admin/specializations/${id}/assign-students`, {
      student_ids: studentIds,
      ...criteria
    })
    return response.data.data
  }

  /**
   * Promote waitlist students
   */
  async promoteWaitlist(id: number, count: number, tenantId?: string): Promise<AssignmentResult> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: AssignmentResult }>(`/admin/specializations/${id}/promote-waitlist`, {
      count
    })
    return response.data.data
  }
}

export const specializationService = new SpecializationService()
