import { createApiClient } from '@/shared/lib/api-client'
import type {
  ModuleSemesterAssignment,
  ModuleSemesterAssignmentFormInput,
  AttachModulesResponse,
  DetachModuleResponse,
  ModuleSemesterFilters
} from '../../types/moduleSemester.types'
import type { Module } from '../../types/module.types'

class ModuleSemesterService {
  /**
   * Get all modules assigned to a semester
   */
  async getSemesterModules(semesterId: number, tenantId?: string): Promise<Module[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: Module[] }>(`/admin/semesters/${semesterId}/modules`)
    return response.data.data
  }

  /**
   * Get all module-semester assignments with filters
   */
  async getAssignments(filters?: ModuleSemesterFilters, tenantId?: string): Promise<ModuleSemesterAssignment[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: ModuleSemesterAssignment[] }>('/admin/module-semester-assignments', {
      params: filters
    })
    return response.data.data
  }

  /**
   * Attach a module to a semester
   */
  async attachModule(
    semesterId: number,
    data: ModuleSemesterAssignmentFormInput,
    tenantId?: string
  ): Promise<ModuleSemesterAssignment> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: ModuleSemesterAssignment }>(
      `/admin/semesters/${semesterId}/modules`,
      data
    )
    return response.data.data
  }

  /**
   * Attach multiple modules to a semester (one by one)
   */
  async attachModules(
    semesterId: number,
    modules: Array<{ id: number; program_id?: number }>,
    tenantId?: string
  ): Promise<void> {
    const client = createApiClient(tenantId)
    
    // Attach each module individually
    const promises = modules.map(module =>
      client.post(`/admin/semesters/${semesterId}/modules`, {
        module_id: module.id,
        program_id: module.program_id || null,
        is_active: true
      })
    )
    
    await Promise.all(promises)
  }

  /**
   * Bulk assign all modules of a specific level to a semester
   */
  async bulkAssignByLevel(
    semesterId: number,
    level: string,
    programId?: number,
    tenantId?: string
  ): Promise<AttachModulesResponse> {
    const client = createApiClient(tenantId)
    const response = await client.post<AttachModulesResponse>(
      `/admin/semesters/${semesterId}/modules/bulk-assign`,
      {
        level,
        programme_id: programId || null
      }
    )
    return response.data
  }

  /**
   * Detach a module from a semester
   */
  async detachModule(semesterId: number, moduleId: number, tenantId?: string): Promise<DetachModuleResponse> {
    const client = createApiClient(tenantId)
    const response = await client.delete<DetachModuleResponse>(`/admin/semesters/${semesterId}/modules/${moduleId}`)
    return response.data
  }

  /**
   * Update module-semester assignment (e.g., toggle is_active)
   */
  async updateAssignment(
    id: number,
    data: Partial<ModuleSemesterAssignmentFormInput>,
    tenantId?: string
  ): Promise<ModuleSemesterAssignment> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: ModuleSemesterAssignment }>(
      `/admin/module-semester-assignments/${id}`,
      data
    )
    return response.data.data
  }
}

export const moduleSemesterService = new ModuleSemesterService()
