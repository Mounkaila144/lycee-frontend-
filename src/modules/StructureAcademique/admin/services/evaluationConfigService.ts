import { createApiClient } from '@/shared/lib/api-client'
import type {
  EvaluationConfig,
  EvaluationConfigFormInput,
  EvaluationTemplate,
  ValidationResult,
  PublishConfigResponse
} from '../../types/evaluationConfig.types'

class EvaluationConfigService {
  /**
   * Get evaluation configurations for a module in a specific semester
   */
  async getConfigurations(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<EvaluationConfig[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: EvaluationConfig[] }>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config`
    )
    return response.data.data
  }

  /**
   * Create a new evaluation configuration
   */
  async createConfiguration(
    moduleId: number,
    semesterId: number,
    data: EvaluationConfigFormInput,
    tenantId?: string
  ): Promise<EvaluationConfig> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: EvaluationConfig }>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config`,
      data
    )
    return response.data.data
  }

  /**
   * Update an evaluation configuration
   */
  async updateConfiguration(
    moduleId: number,
    semesterId: number,
    configId: number,
    data: EvaluationConfigFormInput,
    tenantId?: string
  ): Promise<EvaluationConfig> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: EvaluationConfig }>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/${configId}`,
      data
    )
    return response.data.data
  }

  /**
   * Delete an evaluation configuration
   */
  async deleteConfiguration(moduleId: number, semesterId: number, configId: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/${configId}`)
  }

  /**
   * Apply a template to a module/semester
   */
  async applyTemplate(
    moduleId: number,
    semesterId: number,
    templateId: number,
    tenantId?: string
  ): Promise<EvaluationConfig[]> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: EvaluationConfig[] }>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/apply-template/${templateId}`
    )
    return response.data.data
  }

  /**
   * Validate configuration for a module/semester
   */
  async validateConfiguration(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<ValidationResult> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: ValidationResult }>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/validate`
    )
    return response.data.data
  }

  /**
   * Publish configuration for a module/semester
   */
  async publishConfiguration(
    moduleId: number,
    semesterId: number,
    tenantId?: string
  ): Promise<PublishConfigResponse> {
    const client = createApiClient(tenantId)
    const response = await client.post<PublishConfigResponse>(
      `/admin/modules/${moduleId}/semesters/${semesterId}/evaluation-config/publish`
    )
    return response.data
  }

  /**
   * Get all evaluation templates
   */
  async getTemplates(tenantId?: string): Promise<EvaluationTemplate[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: EvaluationTemplate[] }>('/admin/evaluation-templates')
    return response.data.data
  }

  /**
   * Get active evaluation templates only
   */
  async getActiveTemplates(tenantId?: string): Promise<EvaluationTemplate[]> {
    const client = createApiClient(tenantId)
    const response = await client.get<{ data: EvaluationTemplate[] }>('/admin/evaluation-templates', {
      params: { active: 1 }
    })
    return response.data.data
  }

  /**
   * Create a new evaluation template
   */
  async createTemplate(
    data: Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>,
    tenantId?: string
  ): Promise<EvaluationTemplate> {
    const client = createApiClient(tenantId)
    const response = await client.post<{ data: EvaluationTemplate }>('/admin/evaluation-templates', data)
    return response.data.data
  }

  /**
   * Update an evaluation template
   */
  async updateTemplate(
    id: number,
    data: Partial<Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>>,
    tenantId?: string
  ): Promise<EvaluationTemplate> {
    const client = createApiClient(tenantId)
    const response = await client.put<{ data: EvaluationTemplate }>(`/admin/evaluation-templates/${id}`, data)
    return response.data.data
  }

  /**
   * Delete an evaluation template
   */
  async deleteTemplate(id: number, tenantId?: string): Promise<void> {
    const client = createApiClient(tenantId)
    await client.delete(`/admin/evaluation-templates/${id}`)
  }

  /**
   * Toggle template active status
   */
  async toggleTemplateActive(id: number, tenantId?: string): Promise<EvaluationTemplate> {
    const client = createApiClient(tenantId)
    const response = await client.patch<{ data: EvaluationTemplate }>(
      `/admin/evaluation-templates/${id}/toggle-active`
    )
    return response.data.data
  }
}

export const evaluationConfigService = new EvaluationConfigService()
