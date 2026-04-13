import { createApiClient } from '@/shared/lib/api-client'
import type { Subject, SubjectFormData, SubjectQueryParams } from '../../types/subject.types'

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

class SubjectService {
  async getSubjects(params?: SubjectQueryParams, tenantId?: string): Promise<PaginatedResponse<Subject>> {
    const client = createApiClient(tenantId)
    const response = await client.get<PaginatedResponse<Subject>>('/admin/subjects', { params })
    return response.data
  }

  async getSubject(id: number, tenantId?: string): Promise<Subject> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Subject }>(`/admin/subjects/${id}`)
    return response.data.data
  }

  async createSubject(data: SubjectFormData, tenantId?: string): Promise<Subject> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: Subject }>('/admin/subjects', data)
    return response.data.data
  }

  async updateSubject(id: number, data: Partial<SubjectFormData>, tenantId?: string): Promise<Subject> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Subject }>(`/admin/subjects/${id}`, data)
    return response.data.data
  }

  async deleteSubject(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/subjects/${id}`)
  }
}

export const subjectService = new SubjectService()
