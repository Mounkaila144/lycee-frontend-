import { createApiClient } from '@/shared/lib/api-client'
import type { Cycle, Level } from '../../types/cycle.types'

class CycleService {
  async getCycles(tenantId?: string): Promise<Cycle[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Cycle[] }>('/admin/cycles')
    return response.data.data
  }

  async getCycle(id: number, tenantId?: string): Promise<Cycle> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Cycle }>(`/admin/cycles/${id}`)
    return response.data.data
  }

  async updateCycle(id: number, data: Partial<Cycle>, tenantId?: string): Promise<Cycle> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: Cycle }>(`/admin/cycles/${id}`, data)
    return response.data.data
  }

  async getLevels(params?: { cycle_id?: number }, tenantId?: string): Promise<Level[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Level[] }>('/admin/levels', { params })
    return response.data.data
  }

  async getLevel(id: number, tenantId?: string): Promise<Level> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Level }>(`/admin/levels/${id}`)
    return response.data.data
  }
}

export const cycleService = new CycleService()
