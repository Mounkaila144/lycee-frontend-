import { createApiClient } from '@/shared/lib/api-client'
import type { Series, SeriesFormData } from '../../types/series.types'

class SeriesService {
  async getSeries(params?: { search?: string }, tenantId?: string): Promise<Series[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Series[] }>('/admin/series', { params })
    return response.data.data
  }

  async getSeriesById(id: number, tenantId?: string): Promise<Series> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Series }>(`/admin/series/${id}`)
    return response.data.data
  }

  async createSeries(data: SeriesFormData, tenantId?: string): Promise<Series> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: Series }>('/admin/series', data)
    return response.data.data
  }

  async updateSeries(id: number, data: Partial<SeriesFormData & { is_active?: boolean }>, tenantId?: string): Promise<Series> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Series }>(`/admin/series/${id}`, data)
    return response.data.data
  }
}

export const seriesService = new SeriesService()
