import { createApiClient } from '@/shared/lib/api-client'
import type { Classe, ClasseFormData, ClasseQueryParams, ClasseStats } from '../../types/classe.types'

class ClasseService {
  async getClasses(params?: ClasseQueryParams, tenantId?: string): Promise<Classe[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Classe[] }>('/admin/classes', { params })
    return response.data.data
  }

  async getClasse(id: number, tenantId?: string): Promise<Classe> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Classe }>(`/admin/classes/${id}`)
    return response.data.data
  }

  async createClasse(data: ClasseFormData, tenantId?: string): Promise<Classe> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: Classe }>('/admin/classes', data)
    return response.data.data
  }

  async updateClasse(id: number, data: Partial<ClasseFormData>, tenantId?: string): Promise<Classe> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Classe }>(`/admin/classes/${id}`, data)
    return response.data.data
  }

  async deleteClasse(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/classes/${id}`)
  }

  async getStats(params?: { academic_year_id?: number }, tenantId?: string): Promise<ClasseStats> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: ClasseStats }>('/admin/classes/stats', { params })
    return response.data.data
  }

  async getAvailableHeadTeachers(params?: { academic_year_id?: number; class_id?: number }, tenantId?: string): Promise<{ id: number; firstname: string; lastname: string }[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: { id: number; firstname: string; lastname: string }[] }>('/admin/classes/available-head-teachers', { params })
    return response.data.data
  }
}

export const classeService = new ClasseService()
