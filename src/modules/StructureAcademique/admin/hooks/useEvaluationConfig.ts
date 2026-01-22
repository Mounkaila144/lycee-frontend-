'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { evaluationConfigService } from '../services/evaluationConfigService'
import type {
  EvaluationConfig,
  EvaluationConfigFormInput,
  EvaluationTemplate,
  ValidationResult,
  PublishConfigResponse
} from '../../types/evaluationConfig.types'

export const useEvaluationConfig = (moduleId: number, semesterId: number) => {
  const { tenantId } = useTenant()
  const [configurations, setConfigurations] = useState<EvaluationConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigurations = useCallback(async () => {
    if (!moduleId || !semesterId) return

    try {
      setLoading(true)
      setError(null)
      const data = await evaluationConfigService.getConfigurations(
        moduleId,
        semesterId,
        tenantId || undefined
      )
      setConfigurations(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch configurations'
      setError(message)
      console.error('Error fetching evaluation configurations:', err)
    } finally {
      setLoading(false)
    }
  }, [moduleId, semesterId, tenantId])

  useEffect(() => {
    fetchConfigurations()
  }, [fetchConfigurations])

  const createConfiguration = async (data: EvaluationConfigFormInput): Promise<EvaluationConfig> => {
    const newConfig = await evaluationConfigService.createConfiguration(
      moduleId,
      semesterId,
      data,
      tenantId || undefined
    )
    await fetchConfigurations()
    return newConfig
  }

  const updateConfiguration = async (
    configId: number,
    data: EvaluationConfigFormInput
  ): Promise<EvaluationConfig> => {
    const updated = await evaluationConfigService.updateConfiguration(
      moduleId,
      configId,
      data,
      tenantId || undefined
    )
    await fetchConfigurations()
    return updated
  }

  const deleteConfiguration = async (configId: number): Promise<void> => {
    await evaluationConfigService.deleteConfiguration(moduleId, configId, tenantId || undefined)
    await fetchConfigurations()
  }

  const applyTemplate = async (templateId: number): Promise<EvaluationConfig[]> => {
    const configs = await evaluationConfigService.applyTemplate(
      moduleId,
      semesterId,
      templateId,
      tenantId || undefined
    )
    await fetchConfigurations()
    return configs
  }

  const validateConfiguration = async (): Promise<ValidationResult> => {
    return await evaluationConfigService.validateConfiguration(moduleId, semesterId, tenantId || undefined)
  }

  const publishConfiguration = async (): Promise<PublishConfigResponse> => {
    const result = await evaluationConfigService.publishConfiguration(
      moduleId,
      semesterId,
      tenantId || undefined
    )
    await fetchConfigurations()
    return result
  }

  return {
    configurations,
    loading,
    error,
    refetch: fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    applyTemplate,
    validateConfiguration,
    publishConfiguration
  }
}

export const useEvaluationTemplates = (activeOnly: boolean = false) => {
  const { tenantId } = useTenant()
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = activeOnly
        ? await evaluationConfigService.getActiveTemplates(tenantId || undefined)
        : await evaluationConfigService.getTemplates(tenantId || undefined)
      setTemplates(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates'
      setError(message)
      console.error('Error fetching evaluation templates:', err)
    } finally {
      setLoading(false)
    }
  }, [activeOnly, tenantId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async (
    data: Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EvaluationTemplate> => {
    const newTemplate = await evaluationConfigService.createTemplate(data, tenantId || undefined)
    await fetchTemplates()
    return newTemplate
  }

  const updateTemplate = async (
    id: number,
    data: Partial<Omit<EvaluationTemplate, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<EvaluationTemplate> => {
    const updated = await evaluationConfigService.updateTemplate(id, data, tenantId || undefined)
    await fetchTemplates()
    return updated
  }

  const deleteTemplate = async (id: number): Promise<void> => {
    await evaluationConfigService.deleteTemplate(id, tenantId || undefined)
    await fetchTemplates()
  }

  const toggleActive = async (id: number): Promise<EvaluationTemplate> => {
    const updated = await evaluationConfigService.toggleTemplateActive(id, tenantId || undefined)
    await fetchTemplates()
    return updated
  }

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleActive
  }
}
