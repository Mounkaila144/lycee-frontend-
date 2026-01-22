'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/shared/lib/tenant-context'
import { moduleSemesterService } from '../services/moduleSemesterService'
import type { Module } from '../../types/module.types'
import type { Semester } from '../../types/academicCalendar.types'
import type {
  ModuleSemesterAssignment,
  ModuleSemesterAssignmentFormInput,
  ModuleSemesterFilters
} from '../../types/moduleSemester.types'

/**
 * Hook for managing modules assigned to a specific semester
 */
export const useSemesterModules = (semesterId: number | null) => {
  const { tenantId } = useTenant()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModules = useCallback(async () => {
    if (!semesterId) {
      setModules([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await moduleSemesterService.getSemesterModules(semesterId, tenantId || undefined)
      setModules(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch semester modules'
      setError(errorMessage)
      console.error('Error fetching semester modules:', err)
    } finally {
      setLoading(false)
    }
  }, [semesterId, tenantId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const attachModule = async (data: ModuleSemesterAssignmentFormInput) => {
    if (!semesterId) throw new Error('Semester ID is required')

    try {
      setError(null)
      await moduleSemesterService.attachModule(semesterId, data, tenantId || undefined)
      await fetchModules() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach module'
      setError(errorMessage)
      throw err
    }
  }

  const attachModules = async (modules: Array<{ id: number; program_id?: number }>) => {
    if (!semesterId) throw new Error('Semester ID is required')

    try {
      setError(null)
      await moduleSemesterService.attachModules(semesterId, modules, tenantId || undefined)
      await fetchModules() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach modules'
      setError(errorMessage)
      throw err
    }
  }

  const bulkAssignByLevel = async (level: string, programId?: number) => {
    if (!semesterId) throw new Error('Semester ID is required')

    try {
      setError(null)
      await moduleSemesterService.bulkAssignByLevel(semesterId, level, programId, tenantId || undefined)
      await fetchModules() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk assign modules'
      setError(errorMessage)
      throw err
    }
  }

  const detachModule = async (moduleId: number) => {
    if (!semesterId) throw new Error('Semester ID is required')

    try {
      setError(null)
      await moduleSemesterService.detachModule(semesterId, moduleId, tenantId || undefined)
      await fetchModules() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detach module'
      setError(errorMessage)
      throw err
    }
  }

  return {
    modules,
    loading,
    error,
    refetch: fetchModules,
    attachModule,
    attachModules,
    bulkAssignByLevel,
    detachModule
  }
}

/**
 * Hook for managing all module-semester assignments with filters
 */
export const useModuleSemesterAssignments = (filters?: ModuleSemesterFilters) => {
  const { tenantId } = useTenant()
  const [assignments, setAssignments] = useState<ModuleSemesterAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await moduleSemesterService.getAssignments(filters, tenantId || undefined)
      setAssignments(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assignments'
      setError(errorMessage)
      console.error('Error fetching module-semester assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, tenantId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const updateAssignment = async (id: number, data: Partial<ModuleSemesterAssignmentFormInput>) => {
    try {
      setError(null)
      await moduleSemesterService.updateAssignment(id, data, tenantId || undefined)
      await fetchAssignments() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment'
      setError(errorMessage)
      throw err
    }
  }

  return {
    assignments,
    loading,
    error,
    refetch: fetchAssignments,
    updateAssignment
  }
}
