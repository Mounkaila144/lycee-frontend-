import { createApiClient } from '@/shared/lib/api-client'
import type {
  SubjectClassCoefficient,
  CoefficientFormData,
  CoefficientIndexResponse,
  CoefficientComparisonResponse,
  DuplicateCoefficientsData,
  DuplicateReport
} from '../../types/coefficient.types'

class CoefficientService {
  async getCoefficients(
    params: { level_id: number; series_id?: number },
    tenantId?: string
  ): Promise<CoefficientIndexResponse> {
    const client = createApiClient(tenantId)
    const response = await client.get<CoefficientIndexResponse>('/admin/subject-class-coefficients', { params })
    return response.data
  }

  async getCoefficient(id: number, tenantId?: string): Promise<SubjectClassCoefficient> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: SubjectClassCoefficient }>(`/admin/subject-class-coefficients/${id}`)
    return response.data.data
  }

  async createCoefficient(data: CoefficientFormData, tenantId?: string): Promise<SubjectClassCoefficient> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: SubjectClassCoefficient }>('/admin/subject-class-coefficients', data)
    return response.data.data
  }

  async updateCoefficient(
    id: number,
    data: { coefficient?: number; hours_per_week?: number | null },
    tenantId?: string
  ): Promise<SubjectClassCoefficient> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: SubjectClassCoefficient }>(`/admin/subject-class-coefficients/${id}`, data)
    return response.data.data
  }

  async deleteCoefficient(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/subject-class-coefficients/${id}`)
  }

  async compare(levelId: number, tenantId?: string): Promise<CoefficientComparisonResponse> {
    const client = createApiClient(tenantId)
    const response = await client.get<CoefficientComparisonResponse>('/admin/subject-class-coefficients/compare', {
      params: { level_id: levelId }
    })
    return response.data
  }

  async exportComparePdf(levelId: number, tenantId?: string): Promise<Blob> {
    const client = createApiClient(tenantId)
    const response = await client.get('/admin/subject-class-coefficients/compare/export', {
      params: { level_id: levelId },
      responseType: 'blob'
    })
    return response.data
  }

  async duplicate(data: DuplicateCoefficientsData, tenantId?: string): Promise<DuplicateReport> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ report: DuplicateReport }>('/admin/subject-class-coefficients/duplicate', data)
    return response.data.report
  }
}

export const coefficientService = new CoefficientService()
